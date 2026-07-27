const Region = require("./Region");

module.exports = class MapRegion {
    /** @type {Region} */
    region = null;

    /** @type {number} */
    mapRegion_id = null;
    /** @type {number} */
    mapRegion_map_id = null;
    /** @type {number} */
    mapRegion_region_id = null;
    /** @type {string} */
    mapRegion_type = null;
    
    /**
     * Constructor given MapRegion object data
     * @param {Region & MapRegionJoinData} data 
     */
    constructor ( data ) {
        // constructors will() will only use necessary fields
        this.region = new Region( data );

        this.mapRegion_id = data.mapRegion_id;
        this.mapRegion_map_id = data.mapRegion_map_id;
        this.mapRegion_region_id = data.mapRegion_region_id;
        this.mapRegion_type = String( data.mapRegion_type );
    }
}