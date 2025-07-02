module.exports = class MapRegion {
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
     * Constructor given a MapRegion object
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

    /**
     * Constructor given all parameters
     * @param {Number} mapRegion_id 
     * @param {Number} mapRegion_map_id 
     * @param {Number} mapRegion_region_id 
     * @param {String} mapRegion_parent 
     * @param {Number} mapRegion_offsetX 
     * @param {Number} mapRegion_offsetY 
     * @param {Number} mapRegion_scaleX 
     * @param {Number} mapRegion_scaleY 
     * @param {String} mapRegion_state 
     */
    constructor ( mapRegion_id, mapRegion_map_id, mapRegion_region_id, mapRegion_parent, mapRegion_offsetX,
        mapRegion_offsetY, mapRegion_scaleX, mapRegion_scaleY, mapRegion_state ) {
        this.mapRegion_id = mapRegion_id;
        this.mapRegion_map_id = mapRegion_map_id;
        this.mapRegion_region_id = mapRegion_region_id;
        this.mapRegion_parent = mapRegion_parent;
        this.mapRegion_offsetX = mapRegion_offsetX;
        this.mapRegion_offsetY = mapRegion_offsetY;
        this.mapRegion_scaleX = mapRegion_scaleX;
        this.mapRegion_scaleY = mapRegion_scaleY;
        this.mapRegion_state = mapRegion_state;
    }
}