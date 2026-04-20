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
     * Given a list of Polygon elements that exist in the same map as 'this' polygon, return the order
     * of the enclave relative to the other Polygons in this map. So if 'this' polygon is an enclave of
     * a Polygon that doesn't exist in this map, then its order is 0
     * @param {Array<Polygon>} arr 
     * @returns {Number}
     */
    getEnclaveOrder( arr ) {
        const p = objectBinarySearch( arr, "polygon_id", this.polygon_enclave_of_polygon_id );
        return ( p && this.polygon_is_enclave ) ? 1 + new Polygon( p ).getEnclaveOrder( arr ) : 0 ;
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