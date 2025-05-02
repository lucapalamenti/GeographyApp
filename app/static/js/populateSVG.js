import APIClient from "./APIClient.js";
import util from "./util.js";

const svgPadding = 10;

/**
 * Load regions for a given map into an SVG element
 * @param {Map} map map object
 * @param {SVGElement} svg reference to an SVG element
 * @returns {Set} a set of region names
 */
export default async function populateSVG( map, svg ) {
    const regionNames = new Set();
    await APIClient.getRegionsByMapId( map.map_id ).then( async returnedRegions => {
        const polygonTemplate = document.getElementById('polygon-template').content;
        for ( const region of returnedRegions ) {
            const regionId = `${region.mapRegion_parent.split(' ').join('_')}__${util.inputToId( region.region_name )}`;
            let group = svg.querySelector(`#a`);
            // If a group doesn't already exist for this regions's name
            if ( !group ) {
                // Create a new group
                group = polygonTemplate.cloneNode( true ).querySelector('G');
                // Remove empty polygon element
                group.innerHTML = "";
                group.setAttribute('id', regionId);
            }
            for ( const shape of region.region_points.coordinates ) {
                // Create a polygon for the current region
                const p = polygonTemplate.cloneNode( true ).querySelector('POLYGON');
                const points = shape[0];
                // Convert each array index from [1,2] to "1,2" and apply scaling & offsets
                for ( let i = 0; i < points.length; i++ ) {
                    let X = ( points[i][0] + Number( region.mapRegion_offsetX ) ) * map.map_scale * region.mapRegion_scaleX + svgPadding;
                    let Y = ( points[i][1] + Number( region.mapRegion_offsetY ) ) * map.map_scale * region.mapRegion_scaleY + svgPadding;
                    points[i] = `${X.toFixed(6)},${Y.toFixed(6)}`;
                }
                p.setAttribute('points', points.join(' ') );
                group.appendChild( p );
                svg.appendChild( group );
            };
            regionNames.add( regionId );
        };
        if ( map.map_id === 3 || map.map_id === 48 ) virginiaFix( svg );
        svg.classList.remove('hide-polygons');
    }).catch( err => {
        console.error( err );
    });
    return regionNames;
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
