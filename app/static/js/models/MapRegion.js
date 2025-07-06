export default class MapRegion {
    mapRegion_id = null;
    mapRegion_map_id = null;
    mapRegion_region_id = null;
    mapRegion_parent = null;
    mapRegion_offsetX = null;
    mapRegion_offsetY = null;
    mapRegion_scaleX = null;
    mapRegion_scaleY = null;
    mapRegion_state = null;

    /**
     * Constructor given MapRegion object data
     * @param {MapRegion} data 
     */
    constructor ( data ) {
        this.mapRegion_id = data.mapRegion_id;
        this.mapRegion_map_id = data.mapRegion_map_id;
        this.mapRegion_region_id = data.mapRegion_region_id;
        this.mapRegion_parent = data.mapRegion_parent;
        this.mapRegion_offsetX = data.mapRegion_offsetX;
        this.mapRegion_offsetY = data.mapRegion_offsetY;
        this.mapRegion_scaleX = data.mapRegion_scaleX;
        this.mapRegion_scaleY = data.mapRegion_scaleY;
        this.mapRegion_state = data.mapRegion_state;
    }
}