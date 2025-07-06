import APIClient from "./APIClient.js";
import populateSVG from "./populateSVG.js";
import util from "./util.js";

import MapRegion from "./models/MapRegion.js";

const mapName = document.getElementById('map-name');
const mapTemplate = document.getElementById('select-template');
const mapColor = document.getElementById('map-color');

const svg = document.getElementById('templateMap');
const mapContainer = document.getElementById('map-container');
const zoomSlider = document.getElementById('zoom-slider');
const selectedList = document.getElementById('selected-list');
const createButton = document.getElementById('create-button');
const stateButtonsPanel = document.getElementById('state-buttons-panel');

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

// A state for each side button
const states = Object.freeze({
    SELECTING : document.getElementById('select-button'),
    DESELECTING : document.getElementById('deselect-button'),
    DISABLING : document.getElementById('disabled-button'),
});
let state = states.SELECTING;
stateButtonsPanel.addEventListener('click', e => {
    if ( e.target.tagName === "BUTTON" ) {
        // If the user selects a new button
        if ( e.target !== state ) {
            state.classList.remove('btn-selected');
            state = e.target;
            state.classList.add('btn-selected');
        }
    }
});

let dragging = false;
let selectedRegions = new Set();
let disabledRegions = new Set();
let map;
mapTemplate.addEventListener('change', async e => {
    svg.innerHTML = "";
    selectedList.style.display = "none";
    selectedRegions = new Set();
    // Get the chosen map and display it
    await APIClient.getMapById( mapTemplate.value ).then( async returnedMap => {
        map = returnedMap;
        await populateSVG( map, svg ).then( regionNames => {
            svg.querySelectorAll('G').forEach( polygon => {
                polygon.addEventListener('mouseover', mouse => {
                    if ( mouse.button === 0 && dragging ) {
                        changeRegionState( mouse );
                    }
                });
            });
        });
    });
    mapContainer.removeAttribute('hidden');
    mapContainer.classList.add('flex-col');
});

svg.addEventListener('mousedown', mouse => {
    dragging = true;
    if ( mouse.button === 0 && mouse.target.tagName === "polygon" ) {
        changeRegionState( mouse );
    }
});
document.addEventListener('mouseup', e => {
    dragging = false;
    displaySelection();
});

/**
 * Handles changing the state of a region after a user mouses over it
 * @param {MouseEvent} mouse 
 */
function changeRegionState( mouse ) {
    const targetParent = mouse.target.parentNode;
    const targetParentId = targetParent.id;
    switch ( state ) {
        case states.SELECTING:
            selectedRegions.add( targetParentId );
            targetParent.classList.add('selected');
            disabledRegions.delete( targetParentId );
            targetParent.classList.remove('disabled');
            break;
        case states.DESELECTING:
            selectedRegions.delete( targetParentId );
            targetParent.classList.remove('selected');
            disabledRegions.delete( targetParentId );
            targetParent.classList.remove('disabled');
            break;
        case states.DISABLING:
            selectedRegions.delete( targetParentId );
            targetParent.classList.remove('selected');
            disabledRegions.add( targetParentId );
            targetParent.classList.add('disabled');
            break;
    }
}

function displaySelection() {
    selectedList.innerHTML = "";
    selectedList.style.display = "flex";
    const sort = {};
    if ( selectedRegions.size === 0 ) {
        selectedList.style.display = "none";
        return;
    }
    selectedRegions.forEach( shapeName => {
        const split = shapeName.split('__');
        let parent = util.idToParent( shapeName );
        // If there isn't already a section for this parent
        if ( !sort[parent] ) {
            sort[parent] = [`__${split[1]}`];
        } else {
            sort[parent].push( `__${split[1]}` );
        }
    });
    Object.entries( sort ).forEach( ([parent, list]) => {
        const h5 = document.createElement('H5');
        h5.textContent = `${parent} (${list.length})`;
        selectedList.appendChild( h5 );

        const div = document.createElement('DIV');
        div.classList.add("list-1");
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
    if ( mapName.value && mapTemplate.value && selectedRegions.size > 1 ) {
        await createCustomMap().then( map => {
            document.location = "../";
        }).catch( err => {
            console.error( err );
        });
    }
});

async function createCustomMap() {
    const mapData = {
        map_id : (await APIClient.getMaps( 'map_id DESC' ))[0].map_id + 1,
        map_scale : 1.0,
        map_name : mapName.value,
        map_thumbnail : `${mapName.value.split(' ').join('_')}_Thumbnail.png`,
        map_primary_color : hexToRGB( mapColor.value ),
        map_is_custom : 1
    };
    APIClient.createMap( mapData ).catch( err => {
        console.error( err );
    });

    let mapMinX = Infinity, mapMaxX = 0, mapMinY = Infinity, mapMaxY = 0;
    // Find the minium X & Y values for
    for ( const region of selectedRegions ) {
        let regionMinX = Infinity, regionMinY = Infinity;
        document.getElementById( region ).querySelectorAll('POLYGON').forEach( polygon => {
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

    // Selected Regions
    for ( const region of new Set([ ...selectedRegions, ...disabledRegions ]) ) {
        const parentName = util.idToParent( region );
        const regionName = util.idToInput( region );
        const region_id = (await APIClient.getRegionByMapIdParentName( mapTemplate.value, parentName, regionName )).region_id;

        let regionMinX = Infinity, regionMinY = Infinity;
        document.getElementById( region ).querySelectorAll('POLYGON').forEach( polygon => {
            for ( const point of polygon.points ) {
                if ( point.x < regionMinX ) regionMinX = point.x;
                if ( point.y < regionMinY ) regionMinY = point.y;
            }
        });

        const mapRegion = new MapRegion({
            mapRegion_map_id : mapData.map_id,
            mapRegion_region_id : region_id,
            mapRegion_parent : parentName,
            mapRegion_offsetX : ( regionMinX - mapMinX ) / map.map_scale,
            mapRegion_offsetY : ( regionMinY - mapMinY ) / map.map_scale,
            mapRegion_scaleX : 1.0,
            mapRegion_scaleY : 1.0,
            mapRegion_state : selectedRegions.has( region ) ? "enabled" : "disabled",
        });
        
        await APIClient.createMapRegion( mapRegion ).then( mapRegion => {}).catch( err => {
            console.error( err );
        });
    }

    const xFraction = ( mapMaxX - mapMinX ) / map.map_scale / ( SVG_WIDTH - SVG_PADDING );
    const yFraction = ( mapMaxY - mapMinY ) / map.map_scale / ( SVG_HEIGHT - SVG_PADDING );

    mapData.map_scale = ( 1 / Math.max( xFraction, yFraction ) ).toFixed(6);

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