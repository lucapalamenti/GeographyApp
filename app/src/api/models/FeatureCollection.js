const { SQLGeometry } = require("./SQLGeometry");

class FeatureCollection {
    /** @type {String} */
    type = "FeatureCollection";
    /** @type {String} */
    name = null;
    /** @type {Object} */
    crs = {};
    /** @type {Array<Feature>} */
    features = [];

    /**
     * 
     * @param {string} name 
     */
    constructor ( name ) {
        this.name = name;
    }

    /**
     * Creates and adds a new Feature to the FeatureCollection, and returns it
     * @param {Object} properties 
     * @param {SQLGeometry} geometry 
     * @returns {Feature}
     */
    createFeature( properties = undefined, geometry = undefined ) {
        const feature = new Feature( properties, geometry );
        this.features.push( feature );
        return feature;
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
     * @param {Object} properties 
     * @param {SQLGeometry} geometry 
     */
    constructor ( properties = undefined, geometry = undefined ) {
        if ( properties ) this.setProperties( properties );
        if ( geometry ) this.setGeometry( geometry );
    }

    /**
     * Sets the properties field to the given properties object
     * @param {Object} properties 
     */
    setProperties( properties ) {
        this.properties = properties;
    }

    /**
     * Adds a new property to the properties field
     * @param {string} name 
     * @param {*} value 
     * @throws {TypeError} Thrown if the name param is not a string
     */
    addProperty( name, value ) {
        if ( typeof name !== "string" ) {
            throw new TypeError( `Type of name parameter "${name}" must be string!` );
        }
        this.properties[name] = JSON.stringify( value );
    }

    /**
     * Sets the geometry field to a new SQLGeometry object
     * @param {SQLGeometry} geometry 
     */
    setGeometry( geometry ) {
        this.geometry = SQLGeometry.createAnyType( geometry );
    }
}