const { SQLPolygon } = require("./SQLGeometry.js");

module.exports = class Polygon {
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
        this.polygon_points = new SQLPolygon( data.polygon_points );
    } 
    
    /**
     * Returns an Array of all the Polygon's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.polygon_region_id, this.polygon_is_enclave, this.polygon_enclave_of_region_id, this.polygon_points];
    }

    /**
     * Returns the SQL insert statement for this Polygon object
     * @returns {String}
     */
    insertStatement() {
        return `INSERT INTO \`polygon\` (\`polygon_id\`, \`polygon_region_id\`, \`polygon_is_enclave\`, \`polygon_enclave_of_region_id\`, \`polygon_points\`) VALUES (${this.polygon_id}, ${this.polygon_region_id}, ${this.polygon_is_enclave}, ${this.polygon_enclave_of_region_id}, ${this.polygon_points.toQueryStringWrapped()});`;
    }
};