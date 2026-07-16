const { SQLGeometry } = require("./SQLGeometry.js");

module.exports = class Region {
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

    /**
     * Constructor given Region object data
     * @param {Region} data 
     */
    constructor ( data ) {
        this.region_id = data.region_id;
        this.region_name = data.region_name;
        this.region_type = data.region_type;
        this.region_parent_id = data.region_parent_id;
        this.region_points = data.region_points;
    }

    /**
     * Returns the SQL insert statement for this Region object
     * @returns {String}
     */
    insertStatement() {
        return `INSERT INTO \`region\` (\`region_id\`, \`region_name\`, \`region_parent_id\`, \`region_points\`) VALUES (${this.region_id}, "${this.region_name}", ${this.region_parent_id}, ${this.region_points.toQueryStringWrapped()});`;
    }
};