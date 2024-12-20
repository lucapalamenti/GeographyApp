module.exports = class Shape {
    shape_id = null;
    shape_map_id = null;
    shape_name = null;
    shape_points = null;

    constructor ( data ) {
        this.shape_id = data.shape_id;
        this.shape_map_id = data.shape_map_id;
        this.shape_name = data.shape_name;
        this.shape_points = data.shape_points;
    }
};