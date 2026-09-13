import Region from "./Region.js";

export default class MapRegion {
    /** @type {Region} */
    region = null;

    /** @type {Number} */
    mapRegion_id = null;
    /** @type {Number} */
    mapRegion_map_id = null;
    /** @type {Number} */
    mapRegion_region_id = null;
    /** @type {String} */
    mapRegion_parent = null;
    /** @type {String} */
    mapRegion_type = null;
    
    /**
     * Constructor given MapRegion object data
     * @param {MapRegion} data 
     */
    constructor ( data ) {
        // constructor will() will only use necessary fields
        this.region = new Region( data.region );
        
        this.mapRegion_id = data.mapRegion_id;
        this.mapRegion_map_id = data.mapRegion_map_id;
        this.mapRegion_region_id = data.mapRegion_region_id;
        this.mapRegion_parent = data.mapRegion_parent;
        this.mapRegion_type = String( data.mapRegion_type );
    }
}