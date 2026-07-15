const { SQLGeometry } = require("./SQLGeometry.js");

const ROUND_PLACES = 6;

module.exports = class BackendMapRegion {
    /** @type {Number} */
    region_id = null;
    /** @type {String} */
    region_name = null;
    /** @type {String} */
    region_type = null;
    /** @type {Number} */
    region_parent_id = null;
    /** @type {SQLGeometry} */
    region_points = null;

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
     * @param {BackendMapRegion} data 
     */
    constructor ( data ) {
        this.region_id = data.region_id
        this.region_name = data.region_name;
        this.region_type = data.region_type;
        this.region_parent_id = data.region_parent_id;
        this.region_points = SQLGeometry.createAnyType( data.region_points );

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