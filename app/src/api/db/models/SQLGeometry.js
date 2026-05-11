/**
 * Abstract class for SQL Geometry data types.
 * Subclasses include:
 * @see {SQLPoint}
 * @see {SQLMultiPoint}
 * @see {SQLLineString}
 * @see {sqlMultiLineString}
 * @see {SQLPolygon}
 * @see {SQLMultiPolygon}
 * 
 * @typedef {String} SQLGeometryType Valid values for SQLGeometry.type
 */
class SQLGeometry {
    /** @type {Array<SQLGeometryType>} */
    static #types = ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"];
    /** @type {String} */
    type = null;

    coordinates = null;

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
     * Returns a query string for the coordinates of this SQLGeometry object
     */
    toQueryString() {
        this.#subclassCheck( this.toQueryString );
    }

    /**
     * Returns the query string wrapped in "ST_GEOMFROMTEXT()" for SQL statements
     * @returns {string}
     */
    toQueryStringWrapped() {
        return `ST_GEOMFROMTEXT('${this.toQueryString()}')`;
    }

    /**
     * Throws an error if this method is being called on an abstract SQLGeometry object 
     * @param {undefined | () => any} method 
     */
    #subclassCheck( method ) {
        if ( new.target === SQLGeometry ) {
            const name = method === undefined ? "" : `${method.name}()`;
            throw new Error( `Cannot call ${name} method on abstract SQLGeometry class!` );
        }
    }

    /**
     * Creates an SQLGeometry object from the given data. Must contain the "type" field of
     * an SQLGeometry subclass
     * @param {SQLGeometry} sqlGeometry 
     */
    static createAnyType( sqlGeometry ) {
        switch ( sqlGeometry.type  ) {
            case "Point":
                return new SQLPoint( sqlGeometry );
            case "MultiPoint":
                return new SQLMultiPoint( sqlGeometry );
            case "LineString":
                return new SQLLineString( sqlGeometry );
            case "MultiLineString":
                return new SQLMultiLineString( sqlGeometry );
            case "Polygon":
                return new SQLPolygon( sqlGeometry );
            case "MultiPolygon":
                return new SQLMultiPolygon( sqlGeometry );
            default:
                throw new TypeError( `Invalid SQLGeometry type - "${sqlGeometry.type}"` );
        }
    }
}

/**
 * Javascript representation of the SQL "POINT" data type
 */
class SQLPoint extends SQLGeometry {
    /** @type {Array<Number>} */
    coordinates = null;

    /**
     * Constructor given an object with the same strcuture as an SQL POINT
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
}

/**
 * Javascript representation of the SQL "MULTIPOINT" data type
 */
class SQLMultiPoint extends SQLGeometry {
    /** @type {Array<Array<Number>>} */
    coordinates = null;

    /**
     * Constructor given an object with the same strcuture as an SQL MULTIPOINT
     * @param {SQLMultiPoint} SQLMultiPoint 
     */
    constructor ( SQLMultiPoint ) {
        if ( SQLMultiPoint.type !== "MultiPoint" ) {
            throw new TypeError( `Cannot initialize an SQLMultiPoint object of type "${SQLMultiPoint.type}"` );
        }
        super( "MultiPoint" );
        this.coordinates = SQLMultiPoint["coordinates"];
    }

    /**
     * Returns a query string for the coordinates in the format:
     * MULTIPOINT(0 0,0 0)
     * @returns {string}
     */
    toQueryString() {
        return `MULTIPOINT(${
            this.coordinates.map( point => {
                return point.join(" ");
            }).join(",")
        })`;
    }
}

/**
 * Javascript representation of the SQL "LINESTRING" data type
 */
class SQLLineString extends SQLGeometry {
    /** @type {Array<Array<Number>>} */
    coordinates = null;

    /**
     * Constructor given an object with the same strcuture as an SQL LINESTRING
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
}

/**
 * Javascript representation of the SQL "MULTILINESTRING" data type
 */
class SQLMultiLineString extends SQLGeometry {
    /** @type {Array<Array<Array<Number>>>} */
    coordinates = null;

    /**
     * Constructor given an object with the same strcuture as an SQL MULTILINESTRING
     * @param {SQLMultiLineString} sqlMultiLineString
     */
    constructor ( sqlMultiLineString ) {
        if ( sqlMultiLineString.type !== "MultiLineString" ) {
            throw new TypeError( `Cannot initialize an SQLMultiLineString object of type "${sqlMultiLineString.type}"` );
        }
        super( "MultiLineString" );
        this.coordinates = sqlMultiLineString["coordinates"];
    }

    /**
     * Returns a query string for the coordinates in the format:
     * MULTILINESTRING((0 0,0 0),(0 0,0 0))
     * @returns {string}
     */
    toQueryString() {
        return `MULTILINESTRING((${
            this.coordinates.map( lineString => {
                return lineString.map( point => {
                    return point.join(" ");
                }).join(",");
            }).join("),(")
        }))`;
    }
}

/**
 * Javascript representation of the SQL "POLYGON" data type
 */
class SQLPolygon extends SQLGeometry {
    /** @type {Array<Array<Array<Number>>>} */
    coordinates = null;
    
    /**
     * Constructor given an object with the same strcuture as an SQL POLYGON
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
}

/**
 * Javascript representation of the SQL "MULTIPOLYGON" data type
 */
class SQLMultiPolygon extends SQLGeometry {
    /** @type {Array<Array<Array<Array<Number>>>>} */
    coordinates = null;
    
    /**
     * Constructor given an object with the same strcuture as an SQL MULTIPOLYGON
     * @param {SQLMultiPolygon} sqlMultiPolygon 
     */
    constructor ( sqlMultiPolygon ) {
        if ( sqlMultiPolygon.type !== "MultiPolygon" ) {
            throw new TypeError( `Cannot initialize an SQLMultiPolygon object of type "${sqlMultiPolygon.type}"` );
        }
        super( "MultiPolygon" );
        this.coordinates = sqlMultiPolygon["coordinates"];
    }

    /**
     * Returns a query string for the coordinates in the format:
     * MULTIPOLYGON(((0 0,0 0),(0 0,0 0)),((0 0, 0 0),(0 0,0 0)))
     * @returns {string}
     */
    toQueryString() {
        return `MULTIPOLYGON(((${
            this.coordinates.map( polygon => {
                return polygon.map( lineString => {
                    return lineString.map( point => {
                        return point.join(" ");
                    }).join(",");
                }).join("),(");
            }).join("),(")
        })))`;
    }
}

module.exports = {
    SQLGeometry,
    SQLPoint,
    SQLMultiPoint,
    SQLLineString,
    SQLMultiLineString,
    SQLPolygon,
    SQLMultiPolygon
};
