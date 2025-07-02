module.exports = class Map {
    map_id = null;
    map_scale = null;
    map_name = null;
    map_thumbnail = null;
    map_primary_color = null;
    map_is_custom = null;

    /**
     * Constructor given a Map object
     * @param {Map} data 
     */
    constructor ( data ) {
        this.map_id = data.map_id;
        this.map_scale = data.map_scale;
        this.map_name = data.map_name;
        this.map_thumbnail = data.map_thumbnail;
        this.map_primary_color = data.map_primary_color;
        this.map_is_custom = data.map_is_custom;
    }

    /**
     * Constructor given all parameters
     * @param {*} map_id 
     * @param {*} map_scale 
     * @param {*} map_name 
     * @param {*} map_thumbnail 
     * @param {*} map_primary_color 
     * @param {*} map_is_custom 
     */
    constructor ( map_id, map_scale, map_name, map_thumbnail, map_primary_color, map_is_custom ) {
        this.map_id = map_id;
        this.map_scale = map_scale;
        this.map_name = map_name;
        this.map_thumbnail = map_thumbnail;
        this.map_primary_color = map_primary_color;
        this.map_is_custom = map_is_custom;
    }
};