module.exports = class Map {
    map_id = null;
    map_name = null;
    map_shape_names = null;

    constructor ( data ) {
        this.map_id = data.map_id;
        this.map_name = data.map_name;
        this.map_shape_names = data.map_shape_names;
    }
};