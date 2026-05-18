import { SQLGeometry } from "./SQLGeometry.js";

export class FeatureCollection {
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
export class Feature {
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