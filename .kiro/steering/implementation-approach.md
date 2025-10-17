# Implementation Approach for Interactive Marketing Maps

## Overview
This steering document captures the implementation approach for the interactive marketing maps feature focused on the fertilization industry in Indonesia. It leverages existing schema for agricultural products and sales data, with static geographic boundaries stored as GeoJSON files.

## Data Architecture
- Leverage existing schema from `map_product.ts`, `sales.ts`, and `stall.ts`
- Utilize static GeoJSON files for administrative boundaries stored in `/apps/web/src/lib/data/`
- Extend with new `districts` table if needed for finest-grained visualization
- Map fertilization marketing data to existing `dailySales` and `salesRealizations` tables

## Technical Implementation
- Use Leaflet for map visualization with existing heatmap and marker cluster plugins
- Administrative boundaries loaded from static GeoJSON files rather than database storage
- Location points for heatmaps primarily come from `stalls` table coordinates
- Fertilization types mapped to existing `productBrands` (e.g., Urea, NPK, Petroganik)

## Schema Integration
- Primary data sources: `dailySales` (for quantity/realization), `productBrands` (for fertilization types), `stalls` (for coordinates)
- Administrative references: `provinces`, `regencies`, with potential new `districts` table
- Filtering capabilities using existing `landTypes` and `commodityTypes` from `map_product.ts`

## Geographic Data Approach
- Static boundary files for visualization (provinces, regencies, districts) stored as GeoJSON
- Administrative codes in boundary files map to database records
- Client-side loading of geographic boundaries for performance
- Boundary data structure: {type: "Feature", properties: {code: "XX", name: "NAME"}, geometry: {type: "MultiPolygon", coordinates: [...]}}