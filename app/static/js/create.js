import APIClient from "./APIClient.js";
import populateSVG from "./populateSVG.js";
import util from "./util.js";

const mapName = document.getElementById('map-name');
const mapTemplate = document.getElementById('select-template');
const mapColor = document.getElementById('map-color');

const svg = document.getElementById('templateMap');
const hiddenArea = document.getElementById('hidden-area');
const zoomSlider = document.getElementById('zoom-slider');
const selectedList = document.getElementById('selected-list');
const createButton = document.getElementById('create-button');

const SVG_WIDTH = svg.viewBox.baseVal.width;
const SVG_HEIGHT = svg.viewBox.baseVal.height;
const SVG_PADDING = 20; // pixels

// Populate "Choose Template" selection panel
await APIClient.getMaps( 'map_id' ).then( maps => {
    maps.forEach( map => {
        const option = document.createElement('OPTION');
        option.textContent = map.map_name;
        option.value = map.map_id;
        mapTemplate.appendChild( option );
    });
}).catch( err => {
    console.error( err );
});

let dragging = false;
let selectedShapes = new Set();
let map;
mapTemplate.addEventListener('change', async e => {
    svg.innerHTML = "";
    selectedList.style.display = "none";
    dragging = false;
    selectedShapes = new Set();
    await APIClient.getMapById( mapTemplate.value ).then( async returnedMap => {
        map = returnedMap;
        await populateSVG( returnedMap, svg ).then( shapeNames => {
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

svg.addEventListener('mousedown', e => {
    if ( e.button === 0 && e.target.tagName === "polygon" ) {
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
    displaySelection();
});

function displaySelection() {
    selectedList.innerHTML = "";
    selectedList.style.display = "flex";
    const sort = {};
    if ( selectedShapes.size === 0 ) {
        selectedList.style.display = "none";
        return;
    }
    selectedShapes.forEach( shapeName => {
        const split = shapeName.split('__');
        let parent = split[0];
        // If there is no parent
        if ( parent === "" ) parent = "Regions";
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

createButton.addEventListener('click', async e => {
    e.preventDefault();
    if ( mapName.value && mapTemplate.value ) {
        await createCustomMap();
        // document.location = "../";
    }
});

async function createCustomMap() {
    const mapData = {
        map_id : (await APIClient.getMaps( 'map_id DESC' ))[0].map_id + 1,
        map_scale : 1.0,
        map_name : mapName.value,
        map_thumbnail : `${mapName.value.split(' ').join('_')}_Thumbnail.png`,
        map_primary_color : hexToRGB( mapColor.value )
    };
    APIClient.createMap( mapData ).catch( err => {
        console.error( err );
    });

    let mapMinX = Infinity, mapMaxX = 0, mapMinY = Infinity, mapMaxY = 0;
    // Find the minium X & Y values for
    for ( const shape of selectedShapes ) {
        let regionMinX = Infinity, regionMinY = Infinity;
        document.getElementById( shape ).querySelectorAll('POLYGON').forEach( polygon => {
            for ( const point of polygon.points ) {
                if ( point.x < regionMinX ) regionMinX = point.x;
                if ( point.y < regionMinY ) regionMinY = point.y;

                if ( point.x > mapMaxX ) mapMaxX = point.x;
                if ( point.y > mapMaxY ) mapMaxY = point.y;
            }
        });
        if ( regionMinX < mapMinX ) mapMinX = regionMinX;
        if ( regionMinY < mapMinY ) mapMinY = regionMinY;
    }
    for ( const shape of selectedShapes ) {
        const split = shape.split('__');
        const shapeName = util.capitalizeFirst( split[1].split('_').join(' ') ).split(' ').join('_');
        const shape_id = (await APIClient.getShapeByMapIdParentName( mapTemplate.value, split[0], shapeName )).shape_id;

        let regionMinX = Infinity, regionMinY = Infinity;
        document.getElementById( shape ).querySelectorAll('POLYGON').forEach( polygon => {
            for ( const point of polygon.points ) {
                if ( point.x < regionMinX ) regionMinX = point.x;
                if ( point.y < regionMinY ) regionMinY = point.y;
            }
        });

        const mapShapeData = {
            mapShape_map_id : mapData.map_id,
            mapShape_shape_id : shape_id,
            mapShape_parent : shape.split('__')[0],
            mapShape_offsetX : ( regionMinX - mapMinX ) / map.map_scale,
            mapShape_offsetY : ( regionMinY - mapMinY ) / map.map_scale,
            mapShape_scaleX : 1.0,
            mapShape_scaleY : 1.0
        };
        
        await APIClient.createMapShape( mapShapeData ).then( mapShape => {}).catch( err => {
            console.error( err );
        });
    }

    const xFraction = ( mapMaxX - mapMinX ) / map.map_scale / ( SVG_WIDTH - SVG_PADDING );
    const yFraction = ( mapMaxY - mapMinY ) / map.map_scale / ( SVG_HEIGHT - SVG_PADDING );

    mapData.map_scale = ( 1 / Math.max( xFraction, yFraction ) ).toFixed(5);

    await APIClient.updateMap( mapData ).catch( err => {
        console.error( err );
    });
}

function hexToRGB( hex ) {
    const r = parseInt( hex.substr(1,2), 16 )
    const g = parseInt( hex.substr(3,2), 16 )
    const b = parseInt( hex.substr(5,2), 16 )
    return `${r},${g},${b}`;
}

document.getElementById('btn-1').addEventListener('click', e => {
    APIClient.custom();
});