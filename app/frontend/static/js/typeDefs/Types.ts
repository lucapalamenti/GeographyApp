/**
 * Defines how a Region is used in a given map
 */
export interface MapRegionJoinData {
    mapRegion_map_id: number;
    mapRegion_region_id: number;
    mapRegion_type: MapRegionType;
}

export interface MapBounds {
    mapMinX : number;
    mapMaxX : number;
    mapMinY : number;
    mapMaxY : number;
}

/**
 * Types for map regions 
 */
export type MapRegionType = "enabled" | "disabled" | "outside";