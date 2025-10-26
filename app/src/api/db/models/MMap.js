module.exports = class MMap {
    /** @type {Number} */
    map_id = null;
    /** @type {Number} */
    map_scale = null;
    /** @type {String} */
    map_name = null;
    /** @type {String} */
    map_thumbnail = null;
    /** @type {Number} */
    map_primary_color_R = null;
    /** @type {Number} */
    map_primary_color_G = null;
    /** @type {Number} */
    map_primary_color_B = null;
    /** @type {Boolean} */
    map_is_custom = null;

    /**
     * Constructor given Map object data
     * @param {MMap} data 
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

    /**
     * Returns an Array of all the Map's variables
     * @returns {Array<>}
     */
    getAllVariables() {
        return [this.map_scale, this.map_name, this.map_thumbnail, this.map_primary_color_R, this.map_primary_color_G, this.map_primary_color_B, this.map_is_custom];
    }
};