
/**
 * 
 * @param {Document} document 
 */
export const parse = ( document ) => {
    const rtn = {
        features : []
    };

    for ( const placemark of document.querySelectorAll("Placemark") ) {
        // Create properties from SimpleData
        const properties = {};
        for ( const simpleData of placemark.querySelectorAll("ExtendedData SchemaData SimpleData") ) {
            properties[simpleData.getAttribute("name")] = simpleData.textContent;
        }

        const geometry = {};
        for ( const geometry of placemark.querySelectorAll("Point, Polygon, Linestring") ) {
            parseGeometry( geometry );
        }


        rtn.features.push({
            properties : properties,
            geometry : geometry
        });
    }
    return rtn;
}

function parseGeometry(node) {
    switch( node.tagName ) {
        case "Point":
            return parsePoint( node );

        case "Polygon":
            return kmlPolygon2sqlPolygon( node );

        case "LineString":
            return parseLineString( node );

        case "MultiGeometry":
            return [...node.children]
                .flatMap(parseGeometry);

        default:
            return null;
    }
}

/**
 * 
 * @param {Element} polygon 
 */
function kmlPolygon2sqlPolygon( polygon ) {
    polygon.querySelector();
}