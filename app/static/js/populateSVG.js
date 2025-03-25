import APIClient from "./APIClient.js";

const svgPadding = 10;

/**
 * Load shapes for a given map into an SVG element
 * @param {Map} map map object
 * @param {SVGElement} svg reference to an SVG element
 * @returns {Set} a set of shape names
 */
export default async function populateSVG( map, svg ) {
    const shapeNames = new Set();
    await APIClient.getShapesByMapId( map.map_id ).then( async returnedShapes => {
        const polygonTemplate = document.getElementById('polygon-template').content;
        for ( const region of returnedShapes ) {
            const regionId = `${region.mapShape_parent}__${region.shape_name.split(' ').join('_').split("'").join('-').toLowerCase()}`;
            let group = svg.querySelector(`#a`);
            // If a group doesn't already exist for this shape's name
            if ( !group ) {
                // Create a new group
                group = polygonTemplate.cloneNode( true ).querySelector('G');
                // Remove empty polygon element
                group.innerHTML = "";
                group.setAttribute('id', regionId);
            }
            for ( const shape of region.shape_points.coordinates ) {
                // Create a polygon for the current shape
                const p = polygonTemplate.cloneNode( true ).querySelector('POLYGON');
                const points = shape[0];
                // Convert each array index from [1,2] to "1,2" and apply scaling & offsets
                for ( let i = 0; i < points.length; i++ ) {
                    let X = ( points[i][0] + Number( region.mapShape_offsetX ) ) * map.map_scale * region.mapShape_scaleX + svgPadding;
                    let Y = ( points[i][1] + Number( region.mapShape_offsetY ) ) * map.map_scale * region.mapShape_scaleY + svgPadding;
                    points[i] = `${X.toFixed(6)},${Y.toFixed(6)}`;
                }
                p.setAttribute('points', points.join(' ') );
                group.appendChild( p );
                svg.appendChild( group );
            };
            shapeNames.add( regionId );
        };
        if ( map.map_id === 3 || map.map_id === 48 ) virginiaFix( svg );
        svg.classList.remove('hide-polygons');
    }).catch( err => {
        console.error( err );
    });
    return shapeNames;
}

/**
 * Moves Virginia cities to the bottom of the svg element so that they show up on
 * top of the counties that surround them
 */
function virginiaFix( svg ) {
    const arr = [];
    svg.querySelectorAll('G').forEach( group => {
        if ( group.id.endsWith( "_city" ) ) arr.push( svg.removeChild( group ) );
    });
    arr.forEach( group => {
        svg.append( group );
    });
}
