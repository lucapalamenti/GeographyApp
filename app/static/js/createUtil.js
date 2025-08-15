const svg = document.getElementById('templateMap');
const mapOutline = document.getElementById('map-outline');

const SVG_WIDTH = svg.viewBox.baseVal.width;
const SVG_HEIGHT = svg.viewBox.baseVal.height;
const SVG_PADDING = 20; // pixels

/**
 * Find the minium and maximum X & Y values for all "enabled", "disabled, and "herring" regions
 */
const findMinMax = () => {
    let mapMinX = Infinity, mapMaxX = 0, mapMinY = Infinity, mapMaxY = 0;
    for ( const region of svg.querySelectorAll('G G.enabled G.enabled, G G.enabled G.disabled, G G.enabled G.herring') ) {
        let regionMinX = Infinity, regionMinY = Infinity;
        for ( const polygon of region.children ) {
            for ( const point of polygon.points ) {
                if ( point.x < regionMinX ) regionMinX = point.x;
                if ( point.y < regionMinY ) regionMinY = point.y;

                if ( point.x > mapMaxX ) mapMaxX = point.x;
                if ( point.y > mapMaxY ) mapMaxY = point.y;
            }
        };
        if ( regionMinX < mapMinX ) mapMinX = regionMinX;
        if ( regionMinY < mapMinY ) mapMinY = regionMinY;
    }
    return {
        mapMinX : mapMinX,
        mapMaxX : mapMaxX,
        mapMinY : mapMinY,
        mapMaxY : mapMaxY
    };
};

const createOutline = () => {
    const minMax = findMinMax();
    const minX = minMax.mapMinX, maxX = minMax.mapMaxX, minY = minMax.mapMinY, maxY = minMax.mapMaxY;
    let tempWidth = maxX - minX;
    let tempHeight = maxY - minY;
    const xFraction = tempWidth / SVG_WIDTH;
    const yFraction = tempHeight / SVG_HEIGHT;
    let newPadding = SVG_PADDING * ( ( xFraction > yFraction ) ? xFraction : yFraction );
    let x = minX - newPadding;
    let y = minY - newPadding;
    let width = tempWidth + 2 * newPadding;
    let height = tempHeight + 2 * newPadding;
    // Make sure outline is proportional
    if ( xFraction > yFraction ) {
        const newHeight = height * ( xFraction / yFraction )
        y -= ( newHeight - height ) / 2;
        height = newHeight;
    } else {
        const newWidth = width * ( yFraction / xFraction );
        x -= ( newWidth - width ) / 2;
        width = newWidth;
    }
    mapOutline.setAttribute('width', width);
    mapOutline.setAttribute('height', height);
    mapOutline.setAttribute('x', x);
    mapOutline.setAttribute('y', y);
    svg.appendChild( mapOutline );
};

export default {
    findMinMax,
    createOutline
}