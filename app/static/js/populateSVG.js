import APIClient from "./APIClient.js";
import util from "./util/util.js";

import MMap from "./models/MMap.js";
import MapRegion from "./models/MapRegion.js";

import { SVG_WIDTH, SVG_HEIGHT, FOCUS_STATES } from "./variables.js";
import ParentChildMap from "./models/ParentChildMap.js";

const SVG_PADDING = 0.02; // 2 Percent margins

const gTemplate = document.getElementById('svg-g-template').content;
const pathTemplate = document.getElementById('svg-path-template').content;

/**
 * Load regions for a given map into an SVG element
 * @param {MMap} map map object
 * @param {SVGElement} svg SVG html element
 * @returns {ParentChildMap} a map where the keys are parent names and the values are arrays of region names. *The first element of the array is the 
 */
export default async function populateSVG( map, svg ) {
    // Get all mapRegions for this map 
    let mapRegions = await APIClient.getRegionsByMapId( map.map_id );
    // Get width and height of map for centering on the page
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for ( let mapRegion of mapRegions ) {
        if ( FOCUS_STATES.includes( mapRegion.mapRegion_type ) ) {
            const thisMinX = mapRegion.region_points.minXValue();
            if ( thisMinX < minX ) minX = thisMinX;
            const thisMaxX = mapRegion.region_points.maxXValue();
            if ( thisMaxX > maxX ) maxX = thisMaxX;
            const thisMinY = mapRegion.region_points.minYValue();
            if ( thisMinY < minY ) minY = thisMinY;
            const thisMaxY = mapRegion.region_points.maxYValue();
            if ( thisMaxY > maxY ) maxY = thisMaxY;
        }
    }

    // Flip these since the SVG (0,0) is top left
    [minY, maxY] = [-maxY, -minY];

    let mapWidth = ( maxX - minX );
    let mapHeight = ( maxY - minY );
    let startX = minX;
    let startY = minY;
    let svgWidth, svgHeight;
    // // Width ratio is less than height ratio
    // if ( mapWidth / SVG_WIDTH < mapHeight / SVG_HEIGHT ) {
    //     svgWidth = mapHeight * SVG_WIDTH / SVG_HEIGHT;
    //     svgHeight = mapHeight;
    //     startX -= ( svgWidth - mapWidth ) / 2;
    // }
    // // Height ratio is less than width ratio
    // else if ( mapHeight / SVG_HEIGHT < mapWidth / SVG_WIDTH ) {
    //     svgWidth = mapWidth;
    //     svgHeight = mapWidth * SVG_HEIGHT / SVG_WIDTH;
    //     startY -= ( svgHeight - mapHeight ) / 2;
    // }

    // startX -= mapWidth * SVG_PADDING / 2;
    // startY -= mapHeight * SVG_PADDING / 2;
    // svgWidth *= 1 + SVG_PADDING;
    // svgHeight *= 1 + SVG_PADDING;

    // svg.setAttribute( 'viewBox', `${startX} ${startY} ${svgWidth} ${svgHeight}` );
    svg.setAttribute( 'viewBox', `${startX} ${startY} ${mapWidth} ${mapHeight}` );

    // Right now 3/5/2026 region_parent_id can be null because a region like "usa" or "polygon usa" dont exist, so the "parent id" for polygon states is null
    const parentId = mapRegions[0].region_parent_id ? mapRegions[0].region_parent_id : 1;
    const regionMap = new ParentChildMap( ( await APIClient.getRegionById( parentId ) ).region_type );
    for ( const mapRegion of mapRegions ) {
        const parentId = util.inputToId( mapRegion.mapRegion_parent );
        const regionId = util.inputToId( mapRegion.region_name );
        // If there doesn't exist a group for the region's parent, create it
        let parentGroup = svg.querySelector(`:scope > #${parentId}`);
        if ( !parentGroup ) {
            parentGroup = createGElement( parentId )
            svg.appendChild( parentGroup );
            regionMap.addParent( parentId );
        }
        
        // If the parent group doesn't contain a group for the region type, create it
        let typeGroup = parentGroup.querySelector(`.${mapRegion.mapRegion_type}`);
        if ( !typeGroup ) {
            typeGroup = createGElement( "", [mapRegion.mapRegion_type] );
            parentGroup.appendChild( typeGroup );
        }

        let childPath = createPathElement( regionId );
        typeGroup.appendChild( childPath );
        if ( mapRegion.mapRegion_type === "enabled" ) {
            regionMap.addChild( parentId, regionId, mapRegion.region_id );
        }
        childPath.setAttribute('d', mapRegion.region_points.toPathDString());
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