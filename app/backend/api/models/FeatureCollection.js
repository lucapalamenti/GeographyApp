const { SQLGeometry } = require("./SQLGeometry");

class FeatureCollection {
    /** @type {String} */
    type = "FeatureCollection";
    /** @type {Array<Feature>} */
    features = [];

    /**
     * 
     * @param {FeatureCollection} data 
     */
    constructor ( data ) {
        this.features = data.features.map( f => new Feature( f ) );
    }

    /**
     * Returns the properties field of the first feature of this FeatureCollection
     * @returns {FeatureProperties}
     */
    getProperties() {
        return this.features[0].properties;
    }
}

/**
 * @typedef {Object} FeatureProperties A collection of "string":"string" key:value pairs
 */
class Feature {
    /** @type {String} */
    type = "Feature";
    /** @type {FeatureProperties} */
    properties = {};
    /** @type {SQLGeometry} */
    geometry = null;

    /**
     * 
     * @param {Feature} data
     */
    constructor ( data ) {
        this.properties = data.properties;
        this.geometry = SQLGeometry.createAnyType( data.geometry );
    }
}

module.exports = {
    FeatureCollection
};