import APIClient from "./APIClient.js";
import util from "./util.js";

import MMap from "./models/MMap.js";

import { SVG_WIDTH, SVG_HEIGHT, FOCUS_STATES } from "./variables.js";
import Polygon from "./models/Polygon.js";

const SVG_PADDING = 10; // Pixels

const polygonTemplate = document.getElementById('polygon-template').content;

/**
 * Load regions for a given map into an SVG element
 * @param {MMap} map map object
 * @param {SVGElement} svg SVG html element
 * @returns {Map<String,Array<String>} a map where the keys are parent names and the values are arrays of region names
 */
export default async function populateSVG( map, svg ) {
    const regionMap = new Map();
    await APIClient.getPolygonsByMapId( map.map_id ).then( async returnedPolygons => {
        // Get width and height of map for centering on the page
        let minX = Infinity, maxX = 0, minY = Infinity, maxY = 0;
        for ( const polygon of returnedPolygons ) {
            // Only update min/max x/y for states that must be focused on screen
            if ( FOCUS_STATES.includes( polygon.mapRegion_type ) ) {
                const points = polygon.polygon_points.coordinates;
                // Check each point [X,Y] for this Polygon to see if it's a new min/max value
                for ( let i = 0; i < points.length; i++ ) {
                    let X = ( points[i][0] + polygon.mapRegion_offsetX ) * map.map_scale * polygon.mapRegion_scaleX;
                    let Y = ( points[i][1] + polygon.mapRegion_offsetY ) * map.map_scale * polygon.mapRegion_scaleY;
                    if ( X < minX ) minX = X;
                    if ( X > maxX ) maxX = X;
                    if ( Y < minY ) minY = Y;
                    if ( Y > maxY ) maxY = Y;
                }
            }
        }
        const width = maxX - minX, height = maxY - minY;
        const xCenter = ( width / SVG_WIDTH < height / SVG_HEIGHT ) ? ( SVG_WIDTH - width - 2 * SVG_PADDING ) / 2 : 0;
        const yCenter = ( height / SVG_HEIGHT < width / SVG_WIDTH ) ? ( SVG_HEIGHT - height - 2 * SVG_PADDING ) / 2 : 0;

        const gMain = svg.querySelector(`svg > #main`);
        const gEnclaves = svg.querySelector(`svg > #enclaves`);

        for ( const polygon of returnedPolygons ) {
            // Should this polygon be placed into #main or #enclaves
            const layerGroup = ( polygon.polygon_is_enclave ) ? gEnclaves : gMain;
            const parentId = util.inputToId( polygon.mapRegion_parent );
            const regionId = util.inputToId( polygon.region_name );

            // If there doesn't exist a group for the region's parent, create it
            let parentGroup = layerGroup.querySelector(`:scope > #${parentId}`);
            if ( !parentGroup ) {
                parentGroup = createGElement( parentId )
                layerGroup.appendChild( parentGroup );
                regionMap.set( parentId, [] );
            }
            
            // If the parent group doesnt contain a group for the region type, create it
            let typeGroup = parentGroup.querySelector(`.${polygon.mapRegion_type}`);
            if ( !typeGroup ) {
                typeGroup = createGElement( "", [polygon.mapRegion_type] );
                parentGroup.appendChild( typeGroup );
            }

            // Create a group for the current region
            let childGroup = typeGroup.querySelector(`#${regionId}`);
            if ( !childGroup ) {
                childGroup = createGElement( regionId );
                typeGroup.appendChild( childGroup );
            }
            if ( polygon.mapRegion_type === "enabled" ) {
                regionMap.get( parentId ).push( regionId );
            }
            // Create a polygon for the current region
            const p = polygonTemplate.cloneNode( true ).querySelector('POLYGON');
            const points = polygon.polygon_points.coordinates;
            // Convert each array index from [1,2] to "1,2" and apply scaling & offsets
            for ( let i = 0; i < points.length; i++ ) {
                let X = ( points[i][0] + Number( polygon.mapRegion_offsetX ) ) * map.map_scale * polygon.mapRegion_scaleX + SVG_PADDING + xCenter;
                let Y = ( points[i][1] + Number( polygon.mapRegion_offsetY ) ) * map.map_scale * polygon.mapRegion_scaleY + SVG_PADDING + yCenter;
                points[i] = `${X.toFixed(6)},${Y.toFixed(6)}`;
            }
            p.setAttribute('points', points.join(' ') );
            childGroup.appendChild( p );
        };
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
