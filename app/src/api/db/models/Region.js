module.exports = class Region {
    /** @type {Number} */
    region_id = null;
    /** @type {String} */
    region_name = null;
    /** @type {*} */
    region_points = null;

    /**
     * Constructor given Region object data
     * @param {Region} data 
     */
    constructor ( data ) {
        this.region_id = data.region_id;
        this.region_name = data.region_name;
        this.region_points = data.region_points;
    }

    /**
     * Returns an Array of all the Region's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.region_name, this.region_points];
    }
};