module.exports = class Map {
    map_id = null;
    map_scale = null;
    map_name = null;
    map_thumbnail = null;
    map_primary_color = null;
    map_is_custom = null;

    constructor ( data ) {
        this.map_id = data.map_id;
        this.map_scale = data.map_scale;
        this.map_name = data.map_name;
        this.map_thumbnail = data.map_thumbnail;
        this.map_primary_color = data.map_primary_color;
        this.map_is_custom = data.map_is_custom;
    }
};