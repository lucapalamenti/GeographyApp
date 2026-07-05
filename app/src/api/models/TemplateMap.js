const { FeatureCollection } = require("./FeatureCollection");

module.exports = class TemplateMap {
    /** @type {string} */
    map_name = null;
    /** @type {string} */
    region_type = null;
    /** @type {string} */
    region_name_key = null;
    /** @type {string | undefined} */
    #region_parent_name_key = null;
    /** @type {FeatureCollection} */
    new_feature_collection = null;

    /**
     * 
     * @param {TemplateMap} data 
     */
    constructor ( data ) {
        this.map_name = data.map_name;
        this.region_type = data.region_type;
        this.region_name_key = data.region_name_key;
        this.#region_parent_name_key = data.region_parent_name_key;
        this.new_feature_collection = data.new_feature_collection;
    }

    getRegionParentNameKey() {
        return this.#region_parent_name_key ? this.#region_parent_name_key : "Earth";
    }

    verifyState() {
        if ( !this.map_name || !this.region_type || !this.region_name_key ) {
            throw new Error( 'All required TemplateMap fields are not populated!' );
        }
    }
}