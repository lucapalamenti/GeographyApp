const { SQLGeometry } = require("./SQLGeometry");

class FeatureCollection {
    /** @type {String} */
    type = "FeatureCollection";
    /** @type {String} */
    name = null;
    /** @type {Array<Feature>} */
    features = [];

    /**
     * 
     * @param {FeatureCollection} data 
     */
    constructor ( data ) {
        this.name = data.name;
        this.features = data.features.map( f => new Feature( f ) );
    }
}

class Feature {
    /** @type {String} */
    type = "Feature";
    /** @type {Object} */
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