import { svg, input, showNames } from "./documentElements-game.js";
import { SVG_WIDTH, SVG_HEIGHT, SVG_ZOOM_START, SVG_ZOOM_INC, SVG_MAX_ZOOMS } from "../variables.js";

// Right click to zoom
svg.addEventListener( 'contextmenu', e => { e.preventDefault(); });
svg.addEventListener( 'contextmenu', zoom );
let zoomLevel = SVG_ZOOM_START;
function zoom( e ) {
    // Only allow if you are not too far zoomed in
    if ( zoomLevel <= SVG_ZOOM_START + SVG_ZOOM_INC * SVG_MAX_ZOOMS ) {
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.style.display = "none";
        });
        const currentVB = svg.getAttribute('viewBox').split(' ').map( value => Number(value) );
        const rect = svg.getBoundingClientRect();
        // X coordinate of zoom viewport
        let startX = currentVB[0] + ( e.clientX - rect.left ) * currentVB[2] / rect.width - currentVB[2] / zoomLevel;
        // Y coordinate of zoom viewport
        let startY = currentVB[1] + ( e.clientY - rect.top ) * currentVB[3] / rect.height - currentVB[3] / zoomLevel;
        // Adjust so zoom is not greater than original viewport
        const maxX = SVG_WIDTH * sumZooms();
        const maxY = SVG_HEIGHT * sumZooms();
        startX = startX < 0 ? 0 : ( startX > maxX ) ? maxX : startX;
        startY = startY < 0 ? 0 : ( startY > maxY ) ? maxY : startY;

        svg.setAttribute('viewBox', `${startX} ${startY} ${ currentVB[2] / zoomLevel * 2 } ${ currentVB[3] / zoomLevel * 2 }`);
        showNames.setAttribute( 'disabled', true );
        showNames.checked = false;

        // Escape key to unzoom
        document.addEventListener( 'keydown', unzoom );
        input.focus();
        zoomLevel += SVG_ZOOM_INC;
    }
};

/**
 * Escape to unzoom
 * @param {KeyboardEvent | string} e 
 */
export const unzoom = ( e ) => {
    if ( e.key === 'Escape' || e === 'Escape' ) {
        svg.setAttribute('viewBox', "0 0 1600 900");
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.style.display = "none";
        });
        showNames.removeAttribute( 'disabled' );
        document.removeEventListener( 'keydown', unzoom );
        input.focus();
        zoomLevel = SVG_ZOOM_START;
    }
};

function sumZooms() {
    let i = zoomLevel;
    let rtn = 0;
    while ( i >= SVG_ZOOM_START ) {
        rtn += ( 1 - 2 / i );
        i -= SVG_ZOOM_INC;
    }
    return rtn;
}