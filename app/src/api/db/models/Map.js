module.exports = class Map {
    map_id = null;
    map_scale = null;
    map_name = null;
    map_thumbnail = null;
    map_primary_color_R = null;
    map_primary_color_G = null;
    map_primary_color_B = null;
    map_is_custom = null;

    /**
     * Constructor given Map object data
     * @param {Map} data 
     */
    constructor ( data ) {
        this.map_id = data.map_id;
        this.map_scale = data.map_scale;
        this.map_name = data.map_name;
        this.map_thumbnail = data.map_thumbnail;
        this.map_primary_color_R = data.map_primary_color_R;
        this.map_primary_color_G = data.map_primary_color_G;
        this.map_primary_color_B = data.map_primary_color_B;
        this.map_is_custom = data.map_is_custom;
    }
};