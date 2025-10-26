import { SQLPolygon } from "./SQLGeometry";

export default class Polygon extends SVGPolygonElement {
    /** @type {Number} */
    polygon_id = null;
    /** @type {Number} */
    polygon_region_id = null;
    /** @type {Boolean} */
    polygon_is_enclave = null;
    /** @type {Number} */
    polygon_enclave_of_region_id = null;
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
        this.polygon_enclave_of_region_id = data.polygon_enclave_of_region_id;
        this.polygon_points = data.polygon_points;
    } 
    
    /**
     * Returns an Array of all the Polygon's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.polygon_region_id, this.polygon_is_enclave, this.polygon_enclave_of_region_id, this.polygon_points];
    }
};