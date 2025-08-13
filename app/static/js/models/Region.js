export default class Region {
    region_id = null;
    region_map_id = null;
    region_name = null;
    region_points = null;

    /**
     * Constructor given Region object data
     * @param {Region} data 
     */
    constructor ( data ) {
        this.region_id = data.region_id;
        this.region_map_id = data.region_map_id;
        this.region_name = data.region_name;
        this.region_points = data.region_points;
    }

    /**
     * Returns an Array of all the Region's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.region_map_id, this.region_name, this.region_points];
    }
};