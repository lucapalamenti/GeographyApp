const { SQLGeometry, SQLLineString, SQLPoint, SQLPolygon } = require("../models/SQLGeometry.js");

const ROUND_PLACES = 6;

/**
 * Parses a kml document element and returns a FeatureCollection
 * @param {Document} document 
 * @returns {FeatureCollection}
 */
const parse = ( document ) => {
    const featureCollection = {
        type : "FeatureCollection",
        features : []
    };

    for ( const placemark of document.querySelectorAll("Placemark") ) {
        // Create properties from SimpleData
        const properties = {};
        for ( const simpleData of placemark.querySelectorAll("ExtendedData SchemaData SimpleData") ) {
            properties[simpleData.getAttribute("name")] = simpleData.textContent;
        }

        let geometry;
        const geometryTags = placemark.querySelectorAll("Point, Polygon, LineString");
        // Create set of tag names
        let tagNames = new Set();
        for ( const tag of geometryTags ) {
            tagNames.add( tag.tagName );
        }
        // All tags are the same type
        if ( tagNames.size === 1 ) {
            let sqlGeometries = [];
            for ( const tag of geometryTags ) {
                sqlGeometries.push( parseGeometry( tag ) );
            }
            switch ( geometryTags[0].tagName ) {
                case "Point":
                    geometry = SQLPoint.mergeSQLPointObjects( sqlGeometries );
                    break;

                case "LineString":
                    geometry = SQLLineString.mergeSQLLineStringObjects( sqlGeometries );
                    break;

                case "Polygon":
                    geometry = SQLPolygon.mergeSQLPolygonObjects( sqlGeometries );
                    break;
                
                default:
                    throw new Error( `How did we get here? Unknown tag name!!!` );
            }
        }
        // Tags are of different types
        else {
            throw new Error( "kml Placemark node has geometry nodes of different types. I can't handle this yet!!!" );
        }
        featureCollection.features.push({
            type : "Feature",
            properties : properties,
            geometry : geometry
        });
    }
    return featureCollection;
}

/**
 * 
 * @param {Element} element 
 * @returns {SQLGeometry}
 */
function parseGeometry( element ) {
    switch( element.tagName ) {
        case "Point":
            return kmlPoint2sqlPoint( element );

        case "LineString":
            return parseLineString( element );

        case "Polygon":
            return kmlPolygon2sqlPolygon( element );

        case "MultiGeometry":
            return [...element.children]
                .flatMap(parseGeometry);

        default:
            return null;
    }
}

/**
 * Converts a kml Point document element to an SQLPoint object
 * @param {Element} point 
 * @returns {SQLPoint}
 */
function kmlPoint2sqlPoint( point ) {
    const xyz = point.querySelector( "coordinates" ).textContent.split( "," );
    return new SQLPoint({
        type : "Polygon",
        coordinates : [ string2fixedNumber( xyz[0] ), string2fixedNumber( xyz[1] ) ]
    });
}

/**
 * Converts a kml LineString document element to an SQLLineString
 *  object
 * @param {Element} linestring 
 * @returns {SQLLineString}
 */
function kmlLineString2sqlLineString( linestring ) {
    const coordinates = [];
    const coordinateString = linestring.querySelector( "coordinates" ).textContent;
    let arr = coordinateString.split( " " );
    arr = arr.filter( e => e !== "" );
    for ( const coord of arr ) {
        let xyz = coord.split( "," );
        coordinates.push( [ string2fixedNumber( xyz[0] ), string2fixedNumber( xyz[1] ) ] );
    }
    return new SQLLineString({
        type : "LineString",
        coordinates : coordinates
    });
}

/**
 * Converts a kml Polygon document element to an SQLPolygon object
 * @param {Element} polygon 
 * @returns {SQLPolygon}
 */
function kmlPolygon2sqlPolygon( polygon ) {
    const coordinates = [];
    const coordinateStrings = polygon.querySelectorAll( "coordinates" );
    for ( const coordinatesString of coordinateStrings ) {
        let arr = coordinatesString.textContent.split( " " );
        arr = arr.filter( e => e !== "" );
        const linestring = [];
        for ( const coord of arr ) {
            let xyz = coord.split( "," );
            linestring.push( [ string2fixedNumber( xyz[0] ), string2fixedNumber( xyz[1] ) ] );
        }
        coordinates.push( linestring );
    }
    return new SQLPolygon({
        type : "Polygon",
        coordinates : coordinates
    });
}

/**
 * Converts a number in string form to a number rounded to @see ROUND_PLACES decimal places
 * @param {string} str 
 * @returns 
 */
function string2fixedNumber( str ) {
    return Number( Number( str ).toFixed( ROUND_PLACES ) );
}

module.exports = {
    parse
}