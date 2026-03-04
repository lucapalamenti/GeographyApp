import APIClient from "./APIClient.js";
import util from "./util/util.js";

import MMap from "./models/MMap.js";

import { SVG_WIDTH, SVG_HEIGHT, FOCUS_STATES } from "./variables.js";
import ParentChildMap from "./models/ParentChildMap.js";
import Polygon from "./models/Polygon.js";

const SVG_PADDING = 10; // Pixels

const gTemplate = document.getElementById('svg-g-template').content;
const pathTemplate = document.getElementById('svg-path-template').content;

/**
 * Load regions for a given map into an SVG element
 * @param {MMap} map map object
 * @param {SVGElement} svg SVG html element
 * @returns {ParentChildMap} a map where the keys are parent names and the values are arrays of region names. *The first element of the array is the 
 */
export default async function populateSVG( map, svg ) {
    const regionMap = new ParentChildMap();
    // Get all Polygons for this map and sort them by enclave order (ascending)
    let returnedPolygons = await APIClient.getPolygonsByMapId( map.map_id );
    returnedPolygons.sort( (a, b) => new Polygon( a ).getEnclaveOrder( returnedPolygons ) - new Polygon( b ).getEnclaveOrder( returnedPolygons ) );
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

    for ( const polygon of returnedPolygons ) {
        const parentId = util.inputToId( polygon.mapRegion_parent );
        const regionId = util.inputToId( polygon.region_name );
        // If there doesn't exist a group for the region's parent, create it
        let parentGroup = svg.querySelector(`:scope > #${parentId}`);
        if ( !parentGroup ) {
            parentGroup = createGElement( parentId )
            svg.appendChild( parentGroup );
            regionMap.addParent( parentId );
        }
        
        // If the parent group doesn't contain a group for the region type, create it
        let typeGroup = parentGroup.querySelector(`.${polygon.mapRegion_type}`);
        if ( !typeGroup ) {
            typeGroup = createGElement( "", [polygon.mapRegion_type] );
            parentGroup.appendChild( typeGroup );
        }

        // If a PATH element for the current region doesn't exist, create it
        let childPath = typeGroup.querySelector(`#${regionId}`);
        if ( !childPath ) {
            childPath = createPathElement( regionId );
            typeGroup.appendChild( childPath );
        }
        if ( polygon.mapRegion_type === "enabled" ) {
            regionMap.addChild( parentId, regionId, polygon.polygon_region_id );
        }
        
        const points = polygon.polygon_points.coordinates;
        // Convert each array index from [1,2] to "1,2" and apply scaling & offsets
        for ( let i = 0; i < points.length; i++ ) {
            const X = ( points[i][0] + Number( polygon.mapRegion_offsetX ) ) * map.map_scale * polygon.mapRegion_scaleX + SVG_PADDING + xCenter;
            const Y = ( points[i][1] + Number( polygon.mapRegion_offsetY ) ) * map.map_scale * polygon.mapRegion_scaleY + SVG_PADDING + yCenter;
            points[i] = `${X.toFixed(6)} ${Y.toFixed(6)}`;
        }

        // If this is the first polygon for this region
        if ( childPath.getAttribute('d') === null ) {
            childPath.setAttribute('d', `M${points.join(' L')}Z` );
        } else {
            const prev = childPath.getAttribute('d');
            childPath.setAttribute('d', `${prev} M${points.join(' L')}Z` );
        }
        // If this polygon is an enclave
        if ( polygon.polygon_is_enclave ) {
            const outerPolygon = returnedPolygons.find( p => p.polygon_id === polygon.polygon_enclave_of_polygon_id );
            if ( outerPolygon ) {
                const outerParentId = util.inputToId( outerPolygon.mapRegion_parent );
                const outerRegionId = util.inputToId( outerPolygon.region_name );
                const outerPolygonElement = svg.querySelector( `G#${outerParentId} G PATH#${outerRegionId}` );
                const prev = outerPolygonElement.getAttribute('d');
                outerPolygonElement.setAttribute('d', `${prev} M${points.reverse().join(' L')}Z` );
            }
        }
    };
    return regionMap;
}

/**
 * Creates and returns an SVG G element
 * @param {String} id
 * @param {Array<String>} classList
 * @returns {SVGGElement}
 */
function createGElement( id, classList ) {
    let group = gTemplate.cloneNode( true ).querySelector('G');
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
 * Creates and returns an SVG PATH element
 * @param {String} id
 * @returns {SVGPathElement}
 */
function createPathElement( id ) {
    const path = pathTemplate.cloneNode(true).querySelector('PATH');
    path.setAttribute('id', id);
    return path;
}