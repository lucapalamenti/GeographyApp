import { SQLGeometry } from "./SQLGeometry.js";

const ROUND_PLACES = 6;

export default class BackendMapRegion {
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
    /** @type {Number} */
    mapRegion_offsetX = null;
    /** @type {Number} */
    mapRegion_offsetY = null;
    /** @type {Number} */
    mapRegion_scaleX = null;
    /** @type {Number} */
    mapRegion_scaleY = null;
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
        return [
            this.mapRegion_map_id,
            this.mapRegion_region_id,
            this.mapRegion_parent,
            this.mapRegion_offsetX,
            this.mapRegion_offsetY,
            this.mapRegion_scaleX,
            this.mapRegion_scaleY,
            this.mapRegion_type
        ];
    }
}