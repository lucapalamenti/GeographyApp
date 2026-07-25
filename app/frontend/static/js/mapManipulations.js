import { SVG_WIDTH, SVG_HEIGHT, SVG_ZOOM_START, SVG_ZOOM_INC, SVG_MAX_ZOOMS } from "./variables.js";

let zoomLevel = SVG_ZOOM_START;
let originalVB;
let zoomHandler;
/**
 * Right click to zoom
 * @param {PointerEvent} e 
 * @param {SVGElement} svg
 */
export function zoom( e, svg ) {
    // Only allow if you are not too far zoomed in
    if ( zoomLevel < SVG_ZOOM_START + SVG_ZOOM_INC * SVG_MAX_ZOOMS ) {
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.style.display = "none";
        });
        const currentVB = svg.getAttribute('viewBox').split(' ').map( value => Number(value) );
        if ( zoomLevel === SVG_ZOOM_START ) originalVB = currentVB;

        const rect = svg.getBoundingClientRect();
        
        // Get new viewport values
        let newX = currentVB[0] + ( e.clientX - rect.left ) * currentVB[2] / rect.width - currentVB[2] / zoomLevel;
        let newY = currentVB[1] + ( e.clientY - rect.top ) * currentVB[3] / rect.height - currentVB[3] / zoomLevel;
        const newWidth = currentVB[2] / zoomLevel * 2;
        const newHeight = currentVB[3] / zoomLevel * 2;

        // Adjust so zoom is not outside of original viewport
        if ( newX < currentVB[0] ) newX = currentVB[0];
        if ( newX > currentVB[0] + currentVB[2] - newWidth ) newX = currentVB[0] + currentVB[2] - newWidth;
        if ( newY < currentVB[1] ) newY = currentVB[1];
        if ( newY > currentVB[1] + currentVB[3] - newHeight ) newY = currentVB[1] + currentVB[3] - newHeight;

        svg.setAttribute('viewBox', `${newX} ${newY} ${ newWidth } ${ newHeight }`);
        // showNames.setAttribute( 'disabled', true );
        // showNames.checked = false;
        // input.focus();
        zoomLevel += SVG_ZOOM_INC;

        // Escape key to unzoom
        if ( !zoomHandler ) zoomHandler = ( e ) => unzoom( e, svg );
        document.addEventListener( 'keydown', zoomHandler );
    }
};

/**
 * Return SVG to original viewBox by hitting the Escape key
 * @param {KeyboardEvent | string} e 
 * @param {SVGElement} svg
 */
export function unzoom( e, svg ) {
    if ( ( e.key === 'Escape' || e === 'Escape' ) && originalVB ) {
        svg.setAttribute('viewBox', originalVB.join(" ") );
        // originalVB = [];
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.style.display = "none";
        });
        // showNames.removeAttribute( 'disabled' );
        // input.focus();
        zoomLevel = SVG_ZOOM_START;

        document.removeEventListener( 'keydown', zoomHandler );
        if ( zoomHandler ) zoomHandler = null;
    }
};
