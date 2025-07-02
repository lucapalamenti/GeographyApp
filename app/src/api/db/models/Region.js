module.exports = class Region {
    region_id = null;
    region_map_id = null;
    region_name = null;
    region_points = null;

    constructor ( data ) {
        this.region_id = data.region_id;
        this.region_map_id = data.region_map_id;
        this.region_name = data.region_name;
        this.region_points = data.region_points;
    }

    /**
     * Constructor given all parameters
     * @param {*} region_id 
     * @param {*} region_map_id 
     * @param {*} region_name 
     * @param {*} region_points 
     */
    constructor ( region_id, region_map_id, region_name, region_points ) {
        this.region_id = region_id;
        this.region_map_id = region_map_id;
        this.region_name = region_name;
        this.region_points = region_points;
    }
};