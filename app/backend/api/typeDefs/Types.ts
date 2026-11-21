export type MapRegionType = "enabled" | "disabled" | "outside";

export interface MapRegionJoinData {
    mapRegion_map_id: number;
    mapRegion_region_id: number;
    mapRegion_type: MapRegionType;
}