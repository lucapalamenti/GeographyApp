import { svg, mapOutline } from "./documentElements-create.js";
import { SVG_WIDTH, SVG_HEIGHT, SVG_PADDING } from "../variables.js";

/**
 * Returns all Path elements that should be centered and visible on screen
 * @returns {Array<SVGPathElement>}
 */
const getCenteredRegions = () => {
    return svg.querySelectorAll('PATH:is(.enabled, .disabled)');
}

/**
 * Find the minium and maximum X & Y values for all "enabled" and "disabled" regions
 */
const findMinMax = () => {
    let mapMinX = Infinity, mapMaxX = 0, mapMinY = Infinity, mapMaxY = 0;
    for ( const path of getCenteredRegions() ) {
        const svgRect = path.getBBox();
        if ( svgRect.x < mapMinX ) mapMinX = svgRect.x;
        if ( svgRect.x + svgRect.width > mapMaxX ) mapMaxX = svgRect.x + svgRect.width;
        if ( svgRect.y < mapMinY ) mapMinY = svgRect.y;
        if ( svgRect.y + svgRect.height > mapMaxY ) mapMaxY = svgRect.y + svgRect.height;
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
        const newHeight = height * ( xFraction / yFraction );
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
    getCenteredRegions,
    findMinMax,
    createOutline
}