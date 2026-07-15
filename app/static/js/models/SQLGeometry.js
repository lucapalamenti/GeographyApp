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
    /** @type {string} */
    type = null;

    coordinates = null;
    /** Depth of the coordinates array for this SQLGeometry
     * @type {number} */
    depth = null;

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
    minXValue() { this.#subclassCheck( this.minXValue ); }

    /**
     * Returns the maximum X value for this SQLGeometry object
     * @returns {number}
     */
    maxXValue() { this.#subclassCheck( this.maxXValue ); }

    /**
     * Returns the minimum Y value for this SQLGeometry object
     * @returns {number}
     */
    minYValue() { this.#subclassCheck( this.minYValue ); }

    /**
     * Returns the maximum Y value for this SQLGeometry object
     * @returns {number}
     */
    maxYValue() { this.#subclassCheck( this.maxYValue ); }

    /**
     * If this Geometry has coordinates on both sides of 180 degrees longitude, then
     * make sure all X values are negative by subtracting 360 from all positive X values.
     */
    westify() {
        this.#subclassCheck( this.westify );
        // Use depth - 2 so that the returned array is 2D
        /** @type {Array<Array<number>>} */
        const coords = this.coordinates.flat( this.depth - 2 );
        for ( const pair of coords ) {
            if ( pair[0] > 0 ) {
                pair[0] -= 360;
            }
        }
    }

    /**
     * If this Geometry has coordinates on both sides of 180 degrees longitude, then
     * make sure all X values are positive by adding 360 to all negative X values.
     */
    eastify() {
        this.#subclassCheck( this.eastify );
        // Use depth - 2 so that the returned array is 2D
        /** @type {Array<Array<number>>} */
        const coords = this.coordinates.flat( this.depth - 2 );
        for ( const pair of coords ) {
            if ( pair[0] < 0 ) {
                pair[0] += 360;
            }
        }
    }

    /**
     * Translates this Geometry by a given horizontal and vertical amount
     * @param {*} dx x degrees
     * @param {*} dy y degrees
     */
    translate( dx, dy ) {
        this.#subclassCheck( this.largeStep );
        const coords = this.coordinates.flat( this.depth - 2 );
        for ( const pair of coords ) {
            pair[0] += dx;
            pair[1] += dy;
        }
    }
    
    /**
     * Returns the equivalent <path> "d" attribute for this SQLGeometry object
     * @returns {string}
     */
    toPathDString() { this.#subclassCheck( this.toPathDString ); }

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
export class SQLPoint extends SQLGeometry {
    /** @type {Array<Number>} */
    coordinates = null;
    
    depth = 1;

    /**
     * Constructor given an object with the same structure as an SQL POINT
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

    /**
     * @override
     * Since Points cant be on both sides of a line, simply reflect the X value if it's on the line
     */
    westify() {
        if ( this.coordinates[0] === 180 ) {
            this.coordinates[0] = -180;
        }
    }

    /**
     * @override
     * Since Points cant be on both sides of a line, simply reflect the X value if it's on the line
     */
    eastify() {
        if ( this.coordinates[0] === -180 ) {
            this.coordinates[0] = 180;
        }
    }

    toPathDString() {
        return `M${this.coordinates[0]} ${-1 * this.coordinates[1]} Z`;
    }

    /**
     * Takes an array of SQLPoint objects and merges them into an SQLMultiPoint object
     * @param {Array<SQLPoint>} sqlPointArray 
     * @returns {SQLMultiPoint}
     */
    static mergeSQLPointObjects( sqlPointArray ) {
        const coordinates = [];
        for ( const sqlPoint of sqlPointArray ) {
            coordinates.push( sqlPoint.coordinates );
        }
        return new SQLMultiPoint({
            type : "MultiPoint",
            coordinates : coordinates
        });
    }
}

/**
 * Javascript representation of the SQL "MULTIPOINT" data type
 */
export class SQLMultiPoint extends SQLGeometry {
    /** @type {Array<Array<Number>>} */
    coordinates = null;

    depth = 2;

    /**
     * Constructor given an object with the same structure as an SQL MULTIPOINT
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
}

/**
 * Javascript representation of the SQL "LINESTRING" data type
 */
export class SQLLineString extends SQLGeometry {
    /** @type {Array<Array<Number>>} */
    coordinates = null;

    depth = 2;

    /**
     * Constructor given an object with the same structure as an SQL LINESTRING
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
     * Takes an array of SQLLineString objects and merges them into an SQLMultiLineString object
     * @param {Array<SQLLineString>} sqlLineStringArray 
     * @returns {SQLMultiLineString}
     */
    static mergeSQLLineStringObjects( sqlLineStringArray ) {
        const coordinates = [];
        for ( const sqlLineString of sqlLineStringArray ) {
            coordinates.push( sqlLineString.coordinates );
        }
        return new SQLMultiLineString({
            type : "MultiLineString",
            coordinates : coordinates
        });
    }
}

/**
 * Javascript representation of the SQL "MULTILINESTRING" data type
 */
export class SQLMultiLineString extends SQLGeometry {
    /** @type {Array<Array<Array<Number>>>} */
    coordinates = null;

    depth = 3;

    /**
     * Constructor given an object with the same structure as an SQL MULTILINESTRING
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
}

/**
 * Javascript representation of the SQL "POLYGON" data type
 */
export class SQLPolygon extends SQLGeometry {
    /** @type {Array<Array<Array<Number>>>} */
    coordinates = null;

    depth = 3;
    
    /**
     * Constructor given an object with the same structure as an SQL POLYGON
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
     * Takes an array of SQLPolygon objects and merges them into an SQLMultiPolygon object
     * @param {Array<SQLPolygon>} sqlPolygonArray 
     * @returns {SQLMultiPolygon}
     */
    static mergeSQLPolygonObjects( sqlPolygonArray ) {
        const coordinates = [];
        for ( const sqlPolygon of sqlPolygonArray ) {
            coordinates.push( sqlPolygon.coordinates );
        }
        return new SQLMultiPolygon({
            type : "MultiPolygon",
            coordinates : coordinates
        });
    }
}

/**
 * Javascript representation of the SQL "MULTIPOLYGON" data type
 */
export class SQLMultiPolygon extends SQLGeometry {
    /** @type {Array<Array<Array<Array<Number>>>>} */
    coordinates = null;

    depth = 4;
    
    /**
     * Constructor given an object with the same structure as an SQL MULTIPOLYGON
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
}