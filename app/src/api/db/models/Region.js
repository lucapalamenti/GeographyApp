module.exports = class Region {
    /** @type {Number} */
    region_id = null;
    /** @type {String} */
    region_name = null;
    /** @type {Number} */
    region_parent_id = null;

    /**
     * Constructor given Region object data
     * @param {Region} data 
     */
    constructor ( data ) {
        this.region_id = data.region_id;
        this.region_name = data.region_name;
        this.region_parent_id = data.region_parent_id;
    }

    /**
     * Returns an Array of all the Region's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.region_id, this.region_name, this.region_parent_id];
    }

    /**
     * Returns the SQL insert statement for this Region object
     * @returns {String}
     */
    insertStatement() {
        return `INSERT INTO \`region\` (\`region_id\`, \`region_name\`, \`region_parent_id\`) VALUES (${this.region_id}, "${this.region_name}", ${this.region_parent_id});`;
    }
};