/**
 * Abstract class for SQL Geometry data types.
 * Subclasses include:
 * @see {SQLPoint}
 * @see {SQLLineString}
 * @see {SQLPolygon}
 * 
 * @typedef {String} SQLGeometryType Valid values for SQLGeometry.type
 */
class SQLGeometry {
    /** @type {Array<SQLGeometryType>} */
    static #types = ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"];
    /** @type {String} */
    type = null;

    /**
     * @param {SQLGeometryType} type 
     */
    constructor ( type ) {
        if ( new.target === SQLGeometry ) {
            throw new TypeError( "Cannot instantiate abstract SQLGeometry object directly" );
        }
        this.#setType( type );
    }

    /**
     * Sets the type field to the given type parameter
     * @param {String} type - SQLGeometry type
     * @throws {TypeError} if type is not a valid SQLGeometry type
     */
    #setType( type ) {
        // Valid type argument
        if ( !SQLGeometry.#types.includes( type ) ) {
            throw new TypeError( `Invalid SQLGeometry type - "${type}"` );
        }
        this.type = type;
    }

    /**
     * Wraps a geometry SQL query string in the ST_GEOMFROMTEXT format for SQL statements
     * @returns {string} an SQL query string
     */
    static toQueryStringWrapper( text ) {
        if ( new.target === SQLGeometry ) {
            throw new Error( "Cannot call abstract function! Must be defined in subclass!" );
        }
        return `ST_GEOMFROMTEXT('${text}')`;
    }
}

/**
 * Javascript representation of the SQL "POINT" data type
 */
export class SQLPoint extends SQLGeometry {
    /** @type {Array<Number>} */
    coordinates = null;

    /**
     * Constructor given an SQL cell with the POINT data type
     * @param {SQLPoint} sqlPoint
     */
    constructor ( sqlPoint ) {
        if ( sqlPoint.type !== "Point" ) {
            throw new TypeError( `Cannot initialize an SQLPoint object of type "${sqlPoint.type}"` );
        }
        super( "Point" );
        this.coordinates = sqlPoint["coordinates"];
    }

    /**
     * Returns a query string for the coordinates in the format:
     * POINT(0 0)
     * @returns {string}
     */
    toQueryString() {
        return `POINT(${this.coordinates[0]} ${this.coordinates[1]})`;
    }

    /**
     * Returns the query string wrapped in "ST_GEOMFROMTEXT()"
     * @returns {string}
     */
    toQueryStringWrapped() {
        return SQLGeometry.toQueryStringWrapper( this.toQueryString() );
    }
}

/**
 * Javascript representation of the SQL "LINESTRING" data type
 */
export class SQLLineString extends SQLGeometry {
    /** @type {Array<Array<Number>>} */
    coordinates = null;

    /**
     * Constructor given an SQL cell with the LINESTRING data type
     * @param {SQLLineString} sqlLineString
     */
    constructor ( sqlLineString ) {
        if ( sqlLineString.type !== "LineString" ) {
            throw new TypeError( `Cannot initialize an SQLLineString object of type "${sqlLineString.type}"` );
        }
        super( "LineString" );
        this.coordinates = sqlLineString["coordinates"];
    }

    /**
     * Returns a query string for the coordinates in the format:
     * LINESTRING(0 0,0 0)
     * @returns {string}
     */
    toQueryString() {
        return `LINESTRING(${
            this.coordinates.map( point => {
                return point.join(" ");
            }).join(",")
        })`;
    }

    /**
     * Returns the query string wrapped in "ST_GEOMFROMTEXT()"
     * @returns {string}
     */
    toQueryStringWrapped() {
        return SQLGeometry.toQueryStringWrapper( this.toQueryString() );
    }
}

/**
 * Javascript representation of the SQL "POLYGON" data type
 */
export class SQLPolygon extends SQLGeometry {
    /** @type {Array<Array<Array<Number>>>} */
    coordinates = null;
    
    /**
     * Constructor given an SQL cell with the POLYGON data type
     * @param {SQLPolygon} sqlPolygon 
     */
    constructor ( sqlPolygon ) {
        if ( sqlPolygon.type !== "Polygon" ) {
            throw new TypeError( `Cannot initialize an SQLPolygon object of type "${sqlPolygon.type}"` );
        }
        super( "Polygon" );
        this.coordinates = sqlPolygon["coordinates"];
    }

    /**
     * Returns a query string for the coordinates in the format:
     * POLYGON((0 0,0 0),(0 0,0 0))
     * @returns {string}
     */
    toQueryString() {
        return `POLYGON((${
            this.coordinates.map( lineString => {
                return lineString.map( point => {
                    return point.join(" ");
                }).join(",");
            }).join("),(")
        }))`;
    }

    /**
     * Returns the query string wrapped in "ST_GEOMFROMTEXT()"
     * @returns {string}
     */
    toQueryStringWrapped() {
        return SQLGeometry.toQueryStringWrapper( this.toQueryString() );
    }
}
