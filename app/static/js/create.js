import APIClient from "./APIClient.js";
import populateSVG from "./populateSVG.js";
import util from "./util.js";

const selectTemplate = document.getElementById('select-template');
const svg = document.getElementById('templateMap');
const hiddenArea = document.getElementById('hidden-area');
const zoomSlider = document.getElementById('zoom-slider');
const selectedList = document.getElementById('selected-list');

const SVG_WIDTH = 1600;
const SVG_HEIGHT = 900;

await APIClient.getMaps( 'map_id' ).then( maps => {
    maps.forEach( map => {
        const option = document.createElement('OPTION');
        option.textContent = map.map_name;
        option.value = map.map_id;
        selectTemplate.appendChild( option );
    });
}).catch( err => {
    console.error( err );
});

let dragging = false;
let selectedShapes = new Set();
selectTemplate.addEventListener('change', async e => {
    svg.innerHTML = "";
    await APIClient.getMapById( selectTemplate.value ).then( async map => {
        await populateSVG( map, svg ).then( shapeNames => {
            svg.addEventListener('mousedown', e => {
                if ( e.button === 0 ) {
                    if ( e.target.parentNode.classList.contains('selected') ) {
                        selectedShapes.delete( e.target.parentNode.id );
                        e.target.parentNode.classList.remove('selected');
                    } else {
                        dragging = true;
                        selectedShapes.add( e.target.parentNode.id );
                        e.target.parentNode.classList.add('selected');
                    }
                }
            });
            svg.addEventListener('mouseup', e => {
                dragging = false;
                if ( e.target.tagName !== "polygon" ) return;
                displaySelection();
            });
            svg.querySelectorAll('POLYGON').forEach( polygon => {
                polygon.addEventListener('mouseover', e => {
                    if ( e.button === 0 && dragging ) {
                        selectedShapes.add( e.target.parentNode.id );
                        e.target.parentNode.classList.add('selected');
                    }
                });
            });
        });
    });
    hiddenArea.removeAttribute('hidden');
    hiddenArea.classList.add("flex-col");
});

function displaySelection () {
    selectedList.innerHTML = "";
    const sort = {};
    selectedShapes.forEach( shapeName => {
        const split = shapeName.split('__');
        let parent = split[0];
        // If there is no parent
        if ( parent === "" ) parent = "Other";
        // If there isn't already a section for this parent
        if ( !sort[parent] ) {
            sort[parent] = [`__${split[1]}`];
        } else {
            sort[parent].push( `__${split[1]}` );
        }
    });
    Object.entries( sort ).forEach( ([parent, list]) => {
        const h5 = document.createElement('H5');
        h5.textContent = parent.split('_').join(' ');
        selectedList.appendChild( h5 );

        const div = document.createElement('DIV');
        selectedList.appendChild( div );

        list.forEach( item => {
            const p = document.createElement('P');
            p.textContent = util.idToListItem( item );
            div.appendChild( p );
        });
    });
}

// Right click to zoom
svg.addEventListener( 'contextmenu', e => { e.preventDefault(); });
svg.addEventListener( 'contextmenu', zoom );
function zoom( e ) {
    const zoomLevel = zoomSlider.value * 10;
    document.querySelectorAll('.clickLabel').forEach( label => {
        label.style.display = "none";
    });
    const rect = svg.getBoundingClientRect();
    // X coordinate of zoom viewport
    let startX = ( e.clientX - rect.left ) * SVG_WIDTH / rect.width - SVG_WIDTH / zoomLevel;
    // Y coordinate of zoom viewport
    let startY = ( e.clientY - rect.top ) * SVG_HEIGHT / rect.height - SVG_HEIGHT / zoomLevel;
    // Adjust so zoom is not greater than original viewport
    const ratioX = SVG_WIDTH * ( 1 - 2 / zoomLevel );
    const ratioY = SVG_HEIGHT * ( 1 - 2 / zoomLevel );
    startX = startX < 0 ? 0 : ( startX > ratioX ) ? ratioX : startX;
    startY = startY < 0 ? 0 : ( startY > ratioY ) ? ratioY : startY;

    svg.setAttribute('viewBox', `${startX} ${startY} ${ SVG_WIDTH / zoomLevel * 2 } ${ SVG_HEIGHT / zoomLevel * 2 }`);
    svg.classList.add(`zoom-${zoomSlider.value}`);
    svg.removeEventListener( 'contextmenu', zoom );
    zoomSlider.setAttribute( 'disabled', true );

    // Escape key to unzoom
    document.addEventListener( 'keydown', unzoom );
}


function unzoom( e ) {
    if ( e.key !== 'Escape' ) return;
    svg.classList.remove(`zoom-${zoomSlider.value}`);
    svg.setAttribute('viewBox', "0 0 1600 900");
    svg.addEventListener( 'contextmenu', zoom );
    document.querySelectorAll('.clickLabel').forEach( label => {
        label.style.display = "none";
    });
    zoomSlider.removeAttribute( 'disabled' );

    document.removeEventListener( 'keydown', unzoom );
}