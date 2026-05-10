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
export class SQLGeometry {
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
     * Returns the minimum X value for this SQLGeometry object
     * @returns {number}
     */
    minXValue( offset, scale ) {
        if ( new.target === SQLGeometry ) {
            throw new TypeError( "Cannot call minXValue() method on abstract SQLGeometry object directly" );
        }
    }

    /**
     * Returns the maximum X value for this SQLGeometry object
     * @returns {number}
     */
    maxXValue() {
        if ( new.target === SQLGeometry ) {
            throw new TypeError( "Cannot call maxXValue() method on abstract SQLGeometry object directly" );
        }
    }

    /**
     * Returns the minimum Y value for this SQLGeometry object
     * @returns {number}
     */
    minYValue() {
        if ( new.target === SQLGeometry ) {
            throw new TypeError( "Cannot call minYValue() method on abstract SQLGeometry object directly" );
        }
    }

    /**
     * Returns the maximum Y value for this SQLGeometry object
     * @returns {number}
     */
    maxYValue() {
        if ( new.target === SQLGeometry ) {
            throw new TypeError( "Cannot call maxYValue() method on abstract SQLGeometry object directly" );
        }
    }
    
    /**
     * Returns the equivalent <path> "d" attribute for this SQLGeometry object
     * @returns {string}
     */
    toPathDString() {
        if ( new.target === SQLGeometry ) {
            throw new TypeError( "Cannot call toPathDString() method on abstract SQLGeometry object directly" );
        }
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
    
    /**
     * 
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
export class SQLPoint extends SQLGeometry {
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

    minXValue() {
        return this.coordinates[0];
    }
    
    maxXValue() {
        return this.coordinates[0];
    }

    minYValue() {
        return this.coordinates[1];
    }

    maxYValue() {
        return this.coordinates[1];
    }

    toPathDString() {
        return `M${this.coordinates[0]} ${-1 * this.coordinates[1]} Z`;
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
 * Javascript representation of the SQL "MULTIPOINT" data type
 */
export class SQLMultiPoint extends SQLGeometry {
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
    
    minXValue() {
        let minX = Infinity;
        for ( const point of this.coordinates ) {
            if ( point[0] < minX ) minX = point[0];
        }
        return minX;
    }
    
    maxXValue() {
        let maxX = -Infinity;
        for ( const point of this.coordinates ) {
            if ( point[0] > maxX ) maxX = point[0];
        }
        return maxX;
    }

    minYValue() {
        let minY = Infinity;
        for ( const point of this.coordinates ) {
            if ( point[1] < minY ) minY = point[1];
        }
        return minY;
    }

    maxYValue() {
        let maxY = -Infinity;
        for ( const point of this.coordinates ) {
            if ( point[1] > maxY ) maxY = point[1];
        }
        return maxY;
    }

    toPathDString() {
        return `M${
            this.coordinates.map( point => {
                return `${point[0]} ${-1 * point[1]}`;
            }).join(" Z M")
        } Z`;
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
    
    minXValue() {
        let minX = Infinity;
        for ( const point of this.coordinates ) {
            if ( point[0] < minX ) minX = point[0];
        }
        return minX;
    }
    
    maxXValue() {
        let maxX = -Infinity;
        for ( const point of this.coordinates ) {
            if ( point[0] > maxX ) maxX = point[0];
        }
        return maxX;
    }

    minYValue() {
        let minY = Infinity;
        for ( const point of this.coordinates ) {
            if ( point[1] < minY ) minY = point[1];
        }
        return minY;
    }

    maxYValue() {
        let maxY = -Infinity;
        for ( const point of this.coordinates ) {
            if ( point[1] > maxY ) maxY = point[1];
        }
        return maxY;
    }

    toPathDString() {
        return `M${
            this.coordinates.map( point => {
                return `${point[0]} ${-1 * point[1]}`;
            }).join(" L")
        }`;
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
 * Javascript representation of the SQL "MULTILINESTRING" data type
 */
export class SQLMultiLineString extends SQLGeometry {
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
    
    minXValue() {
        let minX = Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[0] < minX ) minX = point[0];
            }
        }
        return minX;
    }
    
    maxXValue() {
        let maxX = -Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[0] > maxX ) maxX = point[0];
            }
        }
        return maxX;
    }

    minYValue() {
        let minY = Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[1] < minY ) minY = point[1];
            }
        }
        return minY;
    }

    maxYValue() {
        let maxY = -Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[1] > maxY ) maxY = point[1];
            }
        }
        return maxY;
    }

    toPathDString() {
        return `M${
            this.coordinates.map( lineString => {
                return lineString.map( point => {
                    return `${point[0]} ${-1 * point[1]}`;
                }).join(" L");
            }).join(" M")
        }`;
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
    
    minXValue() {
        let minX = Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[0] < minX ) minX = point[0];
            }
        }
        return minX;
    }
    
    maxXValue() {
        let maxX = -Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[0] > maxX ) maxX = point[0];
            }
        }
        return maxX;
    }

    minYValue() {
        let minY = Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[1] < minY ) minY = point[1];
            }
        }
        return minY;
    }

    maxYValue() {
        let maxY = -Infinity;
        for ( const lineString of this.coordinates ) {
            for ( const point of lineString ) {
                if ( point[1] > maxY ) maxY = point[1];
            }
        }
        return maxY;
    }

    toPathDString() {
        return `M${
            this.coordinates.map( lineString => {
                return lineString.map( point => {
                    return `${point[0]} ${-1 * point[1]}`;
                }).join(" L");
            }).join(" M")
        } Z`;
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

/**
 * Javascript representation of the SQL "MULTIPOLYGON" data type
 */
export class SQLMultiPolygon extends SQLGeometry {
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
    
    minXValue() {
        let minX = Infinity;
        for ( const polygon of this.coordinates ) {
            for ( const lineString of polygon ) {
                for ( const point of lineString ) {
                    if ( point[0] < minX ) minX = point[0];
                }
            }
        }
        return minX;
    }
    
    maxXValue() {
        let maxX = -Infinity;
        for ( const polygon of this.coordinates ) {
            for ( const lineString of polygon ) {
                for ( const point of lineString ) {
                    if ( point[0] > maxX ) maxX = point[0];
                }
            }
        }
        return maxX;
    }

    minYValue() {
        let minY = Infinity;
        for ( const polygon of this.coordinates ) {
            for ( const lineString of polygon ) {
                for ( const point of lineString ) {
                    if ( point[1] < minY ) minY = point[1];
                }
            }
        }
        return minY;
    }

    maxYValue() {
        let maxY = -Infinity;
        for ( const polygon of this.coordinates ) {
            for ( const lineString of polygon ) {
                for ( const point of lineString ) {
                    if ( point[1] > maxY ) maxY = point[1];
                }
            }
        }
        return maxY;
    }

    toPathDString() {
        return `M${
            this.coordinates.map( polygon => {
                return polygon.map( lineString => {
                    return lineString.map( point => {
                        return `${point[0]} ${-1 * point[1]}`;
                    }).join(" L");
                }).join(" M");
            }).join(" Z M")
        } Z`;
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

    /**
     * Returns the query string wrapped in "ST_GEOMFROMTEXT()"
     * @returns {string}
     */
    toQueryStringWrapped() {
        return SQLGeometry.toQueryStringWrapper( this.toQueryString() );
    }
}