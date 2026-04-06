import pandas as pd
import geopandas as gpd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from shapely.geometry import Point, LineString
import json
import io
import os

app = FastAPI(title="RF Complaint Handling API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
sectors_gdf = None
# Allow overriding via environment variable, or fallback to relative path (one level up from backend/)
GPKG_PATH = os.environ.get("GPKG_PATH", os.path.join(os.path.dirname(__file__), "..", "4G_GCell_20260201.gpkg"))

@app.on_event("startup")
def startup_event():
    global sectors_gdf
    if os.path.exists(GPKG_PATH):
        try:
            sectors_gdf = gpd.read_file(GPKG_PATH)
            # Ensure index or logic is ready if needed
            print(f"Loaded {len(sectors_gdf)} sectors from GPKG.")
        except Exception as e:
            print("Failed to load GPKG:", e)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running"}

class ComplaintLocation(BaseModel):
    lat: float
    lon: float
    num_sites: int = 4

@app.post("/api/nearest_sectors")
def get_nearest_sectors(loc: ComplaintLocation):
    global sectors_gdf
    if sectors_gdf is None:
        raise HTTPException(status_code=500, detail="Sectors database strictly unavailable")
    
    try:
        complaint_pt = Point(loc.lon, loc.lat)
        # Create a tiny gdf for the complaint location in standard WGS84
        c_gdf = gpd.GeoDataFrame(geometry=[complaint_pt], crs="EPSG:4326")
        
        # We need a projected CRS to calculate precise meters
        # Web Mercator is fine for ranking.
        c_gdf_proj = c_gdf.to_crs(epsg=3857)
        # Check current CRS and project
        current_crs = sectors_gdf.crs or "EPSG:4326"
        if not hasattr(sectors_gdf, '_proj_cache'):
            # simple one time projection if it wasn't done
            sectors_proj = sectors_gdf.to_crs(epsg=3857)
        else:
            sectors_proj = sectors_gdf.to_crs(epsg=3857)
            
        sectors_proj['distance_to_complaint'] = sectors_proj.geometry.distance(c_gdf_proj.geometry[0])
        
        nearest_idx = sectors_proj.nsmallest(loc.num_sites, 'distance_to_complaint').index
        
        nearest_sectors = sectors_gdf.loc[nearest_idx].copy()
        
        # Creating LineStrings from complaint to sector centroids
        lines = []
        for geom in nearest_sectors.geometry:
            lines.append(LineString([complaint_pt, geom.centroid]))
            
        lines_gdf = gpd.GeoDataFrame(geometry=lines, crs="EPSG:4326")
        
        return {
            "status": "success",
            "sectors": json.loads(nearest_sectors.to_json()),
            "lines": json.loads(lines_gdf.to_json())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload_kpi")
async def upload_kpi(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    contents = await file.read()
    
    try:
        df = pd.read_csv(io.BytesIO(contents), skiprows=7)
        if 'Cell' in df.columns:
            def parse_cell_string(cell_str):
                parsed = {}
                if pd.isna(cell_str):
                    return pd.Series(parsed)
                parts = cell_str.split(',')
                for part in parts:
                    if '=' in part:
                        k, v = part.split('=', 1)
                        parsed[k.strip()] = v.strip()
                return pd.Series(parsed)

            cell_expanded_df = df['Cell'].apply(parse_cell_string)
            df = pd.concat([df, cell_expanded_df], axis=1)
            df.drop('Cell', axis=1, inplace=True)
            
        df.fillna(0, inplace=True)
        return {
            "status": "success",
            "message": f"Successfully parsed {len(df)} rows.",
            "columns": df.columns.tolist(),
            "sample_data": df.head(3).to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")
