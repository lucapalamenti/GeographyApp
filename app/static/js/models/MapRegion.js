import { SQLMultiPolygon } from "./SQLGeometry.js";

const ROUND_PLACES = 6;

export default class MapRegion {
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
        this.mapRegion_id = data.mapRegion_id;
        this.mapRegion_map_id = data.mapRegion_map_id;
        this.mapRegion_region_id = data.mapRegion_region_id;
        this.mapRegion_parent = data.mapRegion_parent;
        this.mapRegion_type = String( data.mapRegion_type );
    }

    /**
     * Returns an Array of all the MapRegion's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [
            this.mapRegion_map_id,
            this.mapRegion_region_id,
            this.mapRegion_parent,
            this.mapRegion_type
        ];
    }
}