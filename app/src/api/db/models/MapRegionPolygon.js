const { SQLPolygon } = require("./SQLGeometry");

const ROUND_PLACES = 6;

module.exports = class MapRegionPolygon {
    /** @type {Number} */
    polygon_id = null;
    /** @type {Number} */
    polygon_region_id = null;
    /** @type {Boolean} */
    polygon_is_enclave = null;
    /** @type {Number} */
    polygon_enclave_of_polygon_id = null;
    /** @type {SQLPolygon} */
    polygon_points = null;

    /** @type {Number} */
    region_id = null;
    /** @type {String} */
    region_name = null;
    /** @type {Number} */
    region_parent_id = null;

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
     * @param {MapRegionPolygon} data 
     */
    constructor ( data ) {
        this.polygon_id = data.polygon_id;
        this.polygon_region_id = data.polygon_region_id;
        this.polygon_is_enclave = Boolean( data.polygon_is_enclave );
        this.polygon_enclave_of_polygon_id = data.polygon_enclave_of_polygon_id;
        this.polygon_points = new SQLPolygon( data.polygon_points );

        this.region_id = data.region_id;
        this.region_name = data.region_name;
        this.region_parent_id = data.region_parent_id;

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
}