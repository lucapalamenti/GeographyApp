import util from "./util/util.js";

import { FeatureCollection } from "./models/FeatureCollection.js";

const pathTemplate = document.getElementById('svg-path-template').content;

/**
 * 
 * @param {FeatureCollection} featureCollection
 * @param {SVGElement} svg SVG html element
 */
export default async function populateSVGfc( featureCollection, svg ) {
    // Empty the SVG
    svg.replaceChildren();

    let minX = featureCollection.minXValue();
    let maxX = featureCollection.maxXValue();
    let minY = featureCollection.minYValue();
    let maxY = featureCollection.maxYValue();

    // Flip these since the SVG (0,0) is top left
    [minY, maxY] = [-maxY, -minY];

    let mapWidth = ( maxX - minX );
    let mapHeight = ( maxY - minY );
    let startX = minX;
    let startY = minY;
    let svgWidth, svgHeight;

    svg.setAttribute( 'viewBox', `${startX} ${startY} ${mapWidth} ${mapHeight}` );
    
    let i = 0;
    for ( const feature of featureCollection.features ) {
        const path = createPathElement( "" );
        path.setAttribute( 'id', `${i}` );
        path.setAttribute( 'd', feature.geometry.toPathDString() );
        svg.appendChild( path );
        i++;
    }
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