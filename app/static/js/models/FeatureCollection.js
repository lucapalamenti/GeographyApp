import { SQLGeometry } from "./SQLGeometry.js";

export class FeatureCollection {
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

    /**
     * Removes the Feature at the given index
     * @param {number} index 
     */
    removeFeature( index ) {
        this.features.splice( index, 1 );
    }

    /**
     * Returns the minimum X value among all Features in this FeatureCollection
     * @returns {number}
     */
    minXValue() {
        let minX = Infinity;
        for ( const feature of this.features ) {
            const val = feature.geometry.minXValue();
            if ( val < minX ) minX = val;
        }
        return minX;
    }

    /**
     * Returns the maximum X value among all Features in this FeatureCollection
     * @returns {number}
     */
    maxXValue() {
        let maxX = -Infinity;
        for ( const feature of this.features ) {
            const val = feature.geometry.maxXValue();
            if ( val > maxX ) maxX = val;
        }
        return maxX;
    }

    /**
     * Returns the minimum Y value among all Features in this FeatureCollection
     * @returns {number}
     */
    minYValue() {
        let minY = Infinity;
        for ( const feature of this.features ) {
            const val = feature.geometry.minYValue();
            if ( val < minY ) minY = val;
        }
        return minY;
    }

    /**
     * Returns the maximum Y value among all Features in this FeatureCollection
     * @returns {number}
     */
    maxYValue() {
        let maxY = -Infinity;
        for ( const feature of this.features ) {
            const val = feature.geometry.maxYValue();
            if ( val > maxY ) maxY = val;
        }
        return maxY;
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

    /**
     * If this Feature has coordinates on both sides of 180 degrees longitude, then
     * make sure all X values are negative by subtracting 360 from all positive X values.
     */
    westify() {
        this.geometry.westify( this.geometry.coordinates );
    }

    /**
     * If this Feature has coordinates on both sides of 180 degrees longitude, then
     * make sure all X values are positive by adding 360 to all negative X values.
     */
    eastify() {
        this.geometry.eastify( this.geometry.coordinates );
    }
}