export default class Region {
    /** @type {Number} */
    region_id = null;
    /** @type {String} */
    region_name = null;
    /** @type {String} */
    region_type = null;
    /** @type {Number} */
    region_parent_id = null;

    /**
     * Constructor given Region object data
     * @param {Region} data 
     */
    constructor ( data ) {
        this.region_id = data.region_id;
        this.region_name = data.region_name;
        this.region_type = data.region_type;
        this.region_parent_id = data.region_parent_id;
    }

    /**
     * Returns an Array of all the Region's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.region_id, this.region_name, this.region_type, this.region_parent_id];
    }
};