import APIClient from "./APIClient.js";
import populateSVG from "./populateSVG.js";
import util from "./util.js";
import createUtil from "./createUtil.js";

import MapRegion from "./models/MapRegion.js";
import MMap from "./models/MMap.js";

const mapName = document.getElementById('map-name');
const mapTemplate = document.getElementById('select-template');
const mapColor = document.getElementById('map-color');
const mapThumbnail = document.getElementById('map-thumbnail');
const zoomSlider = document.getElementById('zoom-slider');
const showOutline = document.getElementById('show-outline');

const svg = document.getElementById('templateMap');
const mapContainer = document.getElementById('map-container');
const selectedList = document.getElementById('selected-list');
const createButton = document.getElementById('create-button');
const stateButtonsPanel = document.getElementById('state-buttons-panel');
const mapOutline = document.getElementById('map-outline');

const SVG_WIDTH = svg.viewBox.baseVal.width;
const SVG_HEIGHT = svg.viewBox.baseVal.height;
const SVG_PADDING = 20; // pixels

await APIClient.getMaps( "map_id" ).then( maps => {
    // Populate "Choose Template" selection panel
    maps.forEach( map => {
        const option = document.createElement('OPTION');
        option.textContent = map.map_name;
        option.value = map.map_id;
        mapTemplate.appendChild( option );
    });
}).catch( err => {
    console.error( err );
});
// await is necessary even thought VSCode says otherwise
const regionTypes = await APIClient.getStates();
regionTypes.push("deselect");

let selectedType = "enabled";

// Handle user selecting a new region type selector
stateButtonsPanel.addEventListener('click', e => {
    if ( e.target.tagName === "BUTTON" ) {
        // If the user selects a new button
        if ( !e.target.classList.contains('btn-selected') ) {
            stateButtonsPanel.querySelector(`#${selectedType}-btn`).classList.remove('btn-selected');
            selectedType = e.target.id.substring( 0, e.target.id.length - 4 );
            stateButtonsPanel.querySelector(`#${selectedType}-btn`).classList.add('btn-selected');
        }
    }
});

let dragging = false;
let map;
mapTemplate.addEventListener('change', async e => {
    mapOutline.style.display = "none";
    selectedList.style.display = "none";
    mapContainer.style.display = "none";
    for ( const group of svg.querySelectorAll('SVG > G') ) {
        svg.removeChild( group );
    }
    // Get the chosen map and display it
    map = await APIClient.getMapById( mapTemplate.value );
    await populateSVG( map, svg ).then( regionNames => {
        svg.querySelectorAll('G').forEach( polygon => {
            polygon.addEventListener('mouseover', mouse => {
                if ( mouse.button === 0 && dragging ) {
                    changeRegionType( mouse );
                }
            });
        });
    });
    mapContainer.style.display = "flex";
});

svg.addEventListener('mousedown', mouse => {
    dragging = true;
    if ( mouse.button === 0 && mouse.target.tagName === "polygon" ) {
        changeRegionType( mouse );
    }
});
document.addEventListener('mouseup', e => {
    dragging = false;
    if ( svg.querySelectorAll('G G.enabled G.enabled, G G.enabled G.disabled, G G.enabled G.herring').length ) {
        displaySelection();
        if ( showOutline.checked ) {
            createUtil.createOutline();
            mapOutline.style.display = "block";
        }
    }
});

showOutline.addEventListener('change', e => {
    if ( showOutline.checked ) {
        createUtil.createOutline();
        mapOutline.style.display = "block";
    } else {
        mapOutline.style.display = "none";
    }
});

/**
 * Handles changing the state of a region after a user mouses over it
 * @param {MouseEvent} mouse 
 */
function changeRegionType( mouse ) {
    const region = mouse.target.parentElement;
    for ( const className of region.classList ) {
        region.classList.remove( className );
    }
    region.classList.add( selectedType )
}

/**
 * Reset selected regions list and add all currently selected regions
 */
function displaySelection() {
    selectedList.innerHTML = "";
    selectedList.style.display = "flex";
    for ( const type of regionTypes ) {
        const sort = {};
        if ( type != "deselect" ) {
            // Create type header
            const h3 = document.createElement('H3');
            h3.textContent = util.capitalizeFirst( type );
            selectedList.appendChild(h3);
            svg.querySelectorAll(`G G.enabled G.${type}`).forEach( region => {
                let parentGroupId = region.parentElement.parentElement.getAttribute('id');
                // If this parent doesnt yet have any selected regions, initialize its array
                sort[parentGroupId] = sort[parentGroupId] ? sort[parentGroupId].concat( region.getAttribute('id') ) : [region.getAttribute('id')];
            });
            // Iterate through selected regions and desplay them
            Object.entries( sort ).forEach( ([parentName, regionNames]) => {
                // Create header
                const h5 = document.createElement('H5');
                h5.textContent = `${util.idToInput( parentName )} (${regionNames.length})`;
                selectedList.appendChild( h5 );
                // Create div list section
                const div = document.createElement('DIV');
                div.classList.add("list-1");
                selectedList.appendChild( div );
                // Add each selected region to the list
                for ( const name of regionNames ) {
                    const p = document.createElement('P');
                    p.textContent = util.idToInput( name );
                    div.appendChild( p );
                };
            });
        }
    }
    
    // If no regions are selected, hide container
    if ( selectedList.innerHTML === "" ) selectedList.style.display = "none";
}

createButton.addEventListener('click', async e => {
    e.preventDefault();
    if ( mapName.value && mapTemplate.value && svg.querySelectorAll('G G.enabled G.enabled').length > 1 ) {
        await createCustomMap().then( map => {
            document.location = "../";
            console.info("Map created!");
        }).catch( err => {
            console.error( err );
        });
    }
});

async function createCustomMap() {
    const mapData = new MMap({
        map_id : ( await APIClient.getMaps( 'map_id DESC' ) )[0].map_id + 1,
        map_scale : 1.0,
        map_name : mapName.value,
        map_thumbnail : `${mapName.value.split(' ').join('_')}_Thumbnail.png`,
        map_primary_color_R : parseInt( mapColor.value.substr(1,2), 16 ),
        map_primary_color_G : parseInt( mapColor.value.substr(3,2), 16 ),
        map_primary_color_B : parseInt( mapColor.value.substr(5,2), 16 ),
        map_is_custom : 1
    });
    APIClient.createMap( mapData ).catch( err => {
        console.error( err );
    });

    // Find min and max X & Y values
    const minMax = createUtil.findMinMax();
    let mapMinX = minMax.mapMinX, mapMaxX = minMax.mapMaxX, mapMinY = minMax.mapMinY, mapMaxY = minMax.mapMaxY;

    // For each region type
    for ( const typeName of regionTypes ) {
        // For each selected region of this type
        for ( const region of svg.querySelectorAll(`G G.enabled G.${typeName}`) ) {
            const parentName = util.idToParent( region.parentElement.parentElement.id );
            const regionName = util.idToInput( region.id );
            const region_id = (await APIClient.getRegionByMapIdParentName( mapTemplate.value, parentName, regionName )).region_id;

            let regionMinX = Infinity, regionMinY = Infinity;
            for ( const polygon of region.children ) {
                for ( const point of polygon.points ) {
                    if ( point.x < regionMinX ) regionMinX = point.x;
                    if ( point.y < regionMinY ) regionMinY = point.y;
                }
            };

            // Create the mapRegion
            const mapRegion = new MapRegion({
                mapRegion_map_id : mapData.map_id,
                mapRegion_region_id : region_id,
                mapRegion_parent : parentName,
                mapRegion_offsetX : ( regionMinX - mapMinX ) / map.map_scale,
                mapRegion_offsetY : ( regionMinY - mapMinY ) / map.map_scale,
                mapRegion_scaleX : 1.0,
                mapRegion_scaleY : 1.0,
                mapRegion_type : typeName
            });
            await APIClient.createMapRegion( mapRegion ).then( returnedMapRegion => {}).catch( async err => {
                await APIClient.deleteMap( mapData.map_id ).then( res => {
                    console.log( "Map creation aborted, deleting all data." );
                    return;
                });
                console.error( err );
            });
        }
    }

    const xFraction = ( mapMaxX - mapMinX ) / map.map_scale / ( SVG_WIDTH - SVG_PADDING );
    const yFraction = ( mapMaxY - mapMinY ) / map.map_scale / ( SVG_HEIGHT - SVG_PADDING );

    mapData.map_scale = ( 1 / Math.max( xFraction, yFraction ) ).toFixed(6);

    await APIClient.updateMap( mapData ).catch( err => {
        console.error( err );
    });
}

mapThumbnail.addEventListener('change', async e => {
    const file = e.target.files[0];
    if ( file ) {
        // file.name = ; Change when ready
        const formData = new FormData();
        formData.append('uploadedFile', file); // uploadedFile is a key
        await APIClient.uploadFile( formData ).then( res => {
            console.log( "File successfully uploaded." );
        }).catch( err => {
            console.error( err );
        });
    }
});

const retrieveBtn = document.getElementById('retrieve');
retrieveBtn.addEventListener('click', async e => {
    await APIClient.retrieveFile("photo1.png").then( res => {
        console.log( res );
    }).catch( err => {
        console.error({message: "ERROR!", error: err});
    });
});

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