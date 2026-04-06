# Project Tasks

_This file will be used to track tasks from the planning phase through implementation, as per the guidelines in gemini.md._

## Phase 1: Foundation & Setup
- [x] Initialize Next.js (or Vite + React) frontend with Tailwind CSS and Framer Motion.
- [x] Initialize FastAPI backend project structure.
- [x] Configure Tailwind for soft gradients, glassmorphism, and particle drift utilities.

## Phase 2: Backend Development (Python/FastAPI)
- [x] Set up an endpoint for uploading `Sample_File_KPI.csv` (handling up to 50MB).
- [x] Implement Pandas logic to skip rows 1-7 and read headers from row 8.
- [x] Implement Pandas logic to cleanse the `Cell` column into `eNodeB Function Name`, `Local Cell ID`, `Cell Name`, `eNodeB ID`, and `Cell FDD TDD indication`.
- [x] Set up filtering logic (Site ID, Site Sector, Cell Name, Date, Time) and return formatted JSON for ECharts.
- [x] Read `4G_GCell_20260201.gpkg` using GeoPandas.
- [x] Create endpoint receiving `lat`, `lon` (complaint location).
- [x] Compute the 2-4 nearest 1st tier site sectors to the complaint location using Shapely/GeoPandas.
- [x] Return the nearest sites' Sector Polygons and dynamic LineString geometries connecting the site to the complaint location.

## Phase 3: Frontend Development (React)
- [x] Create the main dashboard layout focusing on premium dark-mode aesthetics.
- [x] Build the file uploader component (handling CSV files, simulating progress).
- [x] Implement the Mapbox GL component with a custom dark-mode satellite style.
- [x] Overlay geojson polygons (sector wedges) and linestrings (distance connectors) on Mapbox.
- [x] Build the KPI filter sidebar (Integrated as generic Grid processing).
- [x] Implement Apache ECharts to render the grid of trendline charts.
- [x] Apply micro-interactions (button hover glows, cards lifting, Framer Motion particle background).

## Phase 4: Integration & Verification
- [ ] Connect the frontend UI to the FastAPI endpoints.
- [ ] Test CSV ingestion and ensure charts match raw CSV data.
- [ ] Test Map location input and verify that lines draw exactly to the correct wedge polygons.
- [ ] Polish UI animations and shimmer effects.

## Phase 5: Deployment
- [ ] Prepare `render.yaml` for FastAPI deployment.
- [ ] Deploy Next.js frontend to Vercel (connect GitHub repo).
