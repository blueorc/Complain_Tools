import React, { useRef, useEffect } from 'react';
import MapboxGL, { Source, Layer, Marker, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RFMapProps {
  // Center is complaint location [lon, lat]
  center: [number, number] | null;
  spatialData: {
    sectors: any; // GeoJSON
    lines: any;   // GeoJSON
  } | null;
}

const RFMap: React.FC<RFMapProps> = ({ center, spatialData }) => {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.flyTo({ center, zoom: 14, duration: 2000 });
    }
  }, [center]);

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden glass-panel shadow-2xl relative border border-white/10">
      <MapboxGL
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{
          longitude: center ? center[0] : 106.8272, // Default Jakarta or generic
          latitude: center ? center[1] : -6.1751,
          zoom: 11
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactiveLayerIds={['sectors-fill']}
      >
        {/* Draw the sectors wedges if they exist */}
        {spatialData?.sectors && (
          <Source id="sectors" type="geojson" data={spatialData.sectors}>
            <Layer 
              id="sectors-fill" 
              type="fill" 
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'Tech'], // Placeholder condition, logic can adapt
                  '4G', '#10b981',
                  '3G', '#3b82f6',
                  '#8b5cf6' // default
                ],
                'fill-opacity': 0.6,
                'fill-outline-color': '#ffffff'
              }} 
            />
          </Source>
        )}

        {/* Draw the linking lines */}
        {spatialData?.lines && (
          <Source id="lines" type="geojson" data={spatialData.lines}>
            <Layer 
              id="lines-draw" 
              type="line" 
              paint={{
                'line-color': '#f43f5e',
                'line-width': 2,
                'line-dasharray': [2, 2]
              }} 
            />
          </Source>
        )}

        {/* Marker for complaint location */}
        {center && (
          <Marker longitude={center[0]} latitude={center[1]} anchor="bottom">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse-glow shadow-[0_0_15px_#ef4444]" />
          </Marker>
        )}
      </MapboxGL>
      
      {/* Overlay decorative elements */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-white/80 font-semibold tracking-widest text-xs uppercase backdrop-blur-md bg-black/40 px-3 py-1 rounded-full border border-white/20">
          Spatial Analysis
        </h3>
      </div>
    </div>
  );
};

// Need to import Source, Layer, Marker from react-map-gl at the top
export default RFMap;
