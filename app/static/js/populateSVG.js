import APIClient from "./APIClient.js";
import util from "./util.js";

import MMap from "./models/MMap.js";

import { SVG_WIDTH, SVG_HEIGHT, FOCUS_STATES } from "./variables.js";

const SVG_PADDING = 10; // Pixels

const polygonTemplate = document.getElementById('polygon-template').content;

/**
 * Load regions for a given map into an SVG element
 * @param {MMap} map map object
 * @param {SVGElement} svg reference to an SVG element
 * @returns {Map<String,Array<String>} a map where the keys are parent names and the values are arrays of region names
 */
export default async function populateSVG( map, svg ) {
    const regionMap = new Map();
    await APIClient.getRegionsByMapId( map.map_id ).then( async returnedRegions => {
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
            const parentId = util.inputToId( region.mapRegion_parent );
            const regionId = util.inputToId( region.region_name );
            let parentGroup = svg.querySelector(`svg > #${parentId}`);
            // If there doesn't exist a group for the region's parent, create it
            if ( !parentGroup ) {
                parentGroup = createGElement( parentId )
                svg.appendChild( parentGroup );
                regionMap.set( parentId, [] );
            }
            let typeGroup = parentGroup.querySelector(`.${region.mapRegion_type}`);
            // If the parent group doesnt contain a group for the region type, create it
            if ( !typeGroup ) {
                typeGroup = createGElement( "", [region.mapRegion_type] );
                parentGroup.appendChild( typeGroup );
            }
            // Create a group for the current region
            let childGroup = createGElement( regionId );
            if ( region.mapRegion_type === "enabled" ) {
                regionMap.get( parentId ).push( regionId );
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
                childGroup.appendChild( p );
                typeGroup.appendChild( childGroup );
            };
        };
        if ( map.map_id === 3 || map.map_id === 48 ) virginiaFix( svg );
        svg.classList.remove('hide-polygons');
    }).catch( err => {
        console.error( err );
    });
    return regionMap;
}

/**
 * Creates and returns an SVG G element
 * @param {String} id
 * @param {Array<String>} classList
 * @returns {SVGGElement}
 */
function createGElement( id, classList ) {
    let group = polygonTemplate.cloneNode( true ).querySelector('G');
    // Remove empty polygon element
    group.innerHTML = "";
    if ( id ) group.setAttribute('id', id);
    if ( classList ) {
        for ( const className of classList ) {
            group.classList.add( className );
        }
    }
    return group;
}

/**
 * Moves Virginia cities to the bottom of the svg element so that they show up on
 * top of the counties that surround them
 * @param {SVGElement} svg 
 */
function virginiaFix( svg ) {
    svg.querySelectorAll('#virginia G G').forEach( group => {
        if ( group.id.endsWith( "_city" ) ) {
            const parent = group.parentElement;
            parent.appendChild( parent.removeChild( group ) );
        }
    });
}
