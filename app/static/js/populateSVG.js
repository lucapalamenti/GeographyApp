import APIClient from "./APIClient.js";
import util from "./util.js";

import MMap from "./models/MMap.js";

const FOCUS_STATES = ["enabled", "disabled", "herring"];
const SVG_WIDTH = 1600;
const SVG_HEIGHT = 900;
const SVG_PADDING = 10; // Pixels

/**
 * Load regions for a given map into an SVG element
 * @param {MMap} map map object
 * @param {SVGElement} svg reference to an SVG element
 * @returns {Set} a set of region names
 */
export default async function populateSVG( map, svg ) {
    const regionNames = new Set();
    await APIClient.getRegionsByMapId( map.map_id ).then( async returnedRegions => {
        const polygonTemplate = document.getElementById('polygon-template').content;

        // Get width and height of map for centering on the page
        let minX = Infinity, maxX = 0, minY = Infinity, maxY = 0;
        for ( const region of returnedRegions ) {
            if ( FOCUS_STATES.includes( region.mapRegion_type ) ) {
                for ( const shape of region.region_points.coordinates ) {
                    const points = shape[0];
                    // Convert each array index from [1,2] to "1,2" and apply scaling & offsets
                    for ( let i = 0; i < points.length; i++ ) {
                        let X = ( points[i][0] + Number( region.mapRegion_offsetX ) ) * map.map_scale * region.mapRegion_scaleX;
                        let Y = ( points[i][1] + Number( region.mapRegion_offsetY ) ) * map.map_scale * region.mapRegion_scaleY;
                        if ( X < minX ) minX = X;
                        if ( X > maxX ) maxX = X;
                        if ( Y < minY ) minY = Y;
                        if ( Y > maxY ) maxY = Y;
                    }
                }
            }
        }
        const width = maxX - minX, height = maxY - minY;
        const xCenter = ( width / SVG_WIDTH < height / SVG_HEIGHT ) ? ( SVG_WIDTH - width - 2 * SVG_PADDING ) / 2 : 0;
        const yCenter = ( height / SVG_HEIGHT < width / SVG_WIDTH ) ? ( SVG_HEIGHT - height - 2 * SVG_PADDING ) / 2 : 0;

        for ( const region of returnedRegions ) {
            const regionId = `${util.inputToId( region.mapRegion_parent )}__${util.inputToId( region.region_name )}`;
            let group = svg.querySelector(`#a`);
            // If a group doesn't already exist for this regions's name
            if ( !group ) {
                // Create a new group
                group = polygonTemplate.cloneNode( true ).querySelector('G');
                // Remove empty polygon element
                group.innerHTML = "";
                group.setAttribute('id', regionId);
                if ( region.mapRegion_state === "enabled" ) {
                    regionNames.add( regionId );
                } else {
                    group.classList.add( region.mapRegion_state );
                }
            }
            for ( const shape of region.region_points.coordinates ) {
                // Create a polygon for the current region
                const p = polygonTemplate.cloneNode( true ).querySelector('POLYGON');
                const points = shape[0];
                // Convert each array index from [1,2] to "1,2" and apply scaling & offsets
                for ( let i = 0; i < points.length; i++ ) {
                    let X = ( points[i][0] + Number( region.mapRegion_offsetX ) ) * map.map_scale * region.mapRegion_scaleX + SVG_PADDING + xCenter;
                    let Y = ( points[i][1] + Number( region.mapRegion_offsetY ) ) * map.map_scale * region.mapRegion_scaleY + SVG_PADDING + yCenter;
                    points[i] = `${X.toFixed(6)},${Y.toFixed(6)}`;
                }
                p.setAttribute('points', points.join(' ') );
                group.appendChild( p );
                svg.appendChild( group );
            };
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
