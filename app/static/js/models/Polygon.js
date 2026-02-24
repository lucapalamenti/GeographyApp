import { objectBinarySearch } from "../util/searchAlgorithms.js";
import { SQLPolygon } from "./SQLGeometry.js";

export default class Polygon {
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

    /**
     * Constructor given Polygon object data
     * @param {Polygon} data 
     */
    constructor ( data ) {
        this.polygon_id = data.polygon_id;
        this.polygon_region_id = data.polygon_region_id;
        this.polygon_is_enclave = data.polygon_is_enclave;
        this.polygon_enclave_of_polygon_id = data.polygon_enclave_of_polygon_id;
        this.polygon_points = new SQLPolygon( data.polygon_points );
    }

    /**
     * 
     * @param {Array<Polygon>} arr 
     * @returns 
     */
    getEnclaveOrder( arr ) {
        return this.polygon_is_enclave ? 1 + new Polygon( objectBinarySearch( arr, "polygon_id", this.polygon_enclave_of_polygon_id ) ).getEnclaveOrder( arr ) : 0 ;
    }
    
    /**
     * Returns an Array of all the Polygon's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.polygon_region_id, this.polygon_is_enclave, this.polygon_enclave_of_polygon_id, this.polygon_points];
    }

    /**
     * 
     * @param {Array<Polygon>} arr 
     * @returns {Polygon}
     */
    static binarySearchById( arr ) {
        arr
    }
};