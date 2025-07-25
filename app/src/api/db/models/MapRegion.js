const ROUND_PLACES = 6;

module.exports = class MapRegion {
    mapRegion_id = null;
    mapRegion_map_id = null;
    mapRegion_region_id = null;
    mapRegion_parent = null;
    mapRegion_offsetX = null;
    mapRegion_offsetY = null;
    mapRegion_scaleX = null;
    mapRegion_scaleY = null;
    mapRegion_type = null;
    
    /**
     * Constructor given MapRegion object data
     * @param {MapRegion} data 
     */
    constructor ( data ) {
        this.mapRegion_id = data.mapRegion_id;
        this.mapRegion_map_id = data.mapRegion_map_id;
        this.mapRegion_region_id = data.mapRegion_region_id;
        this.mapRegion_parent = data.mapRegion_parent;
        this.mapRegion_offsetX = Number( Number( data.mapRegion_offsetX ).toFixed( ROUND_PLACES ) );
        this.mapRegion_offsetY = Number( Number( data.mapRegion_offsetY ).toFixed( ROUND_PLACES ) );
        this.mapRegion_scaleX = Number( Number( data.mapRegion_scaleX ).toFixed( ROUND_PLACES ) );
        this.mapRegion_scaleY = Number( Number( data.mapRegion_scaleY ).toFixed( ROUND_PLACES ) );
        this.mapRegion_type = String( data.mapRegion_type );
    }

    /**
     * Returns an Array of all the MapRegion's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.mapRegion_map_id, this.mapRegion_region_id, this.mapRegion_parent, this.mapRegion_offsetX, this.mapRegion_offsetY, this.mapRegion_scaleX, this.mapRegion_scaleY, this.mapRegion_type];
    }
}