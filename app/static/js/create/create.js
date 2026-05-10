import APIClient from "../APIClient.js";
import populateSVG from "../populateSVG.js";
import util from "../util/util.js";
import createUtil from "./createUtil.js";
import { zoom } from "../mapManipulations.js";

import MapRegion from "../models/MapRegion.js";
import MMap from "../models/MMap.js";

import { navBar } from "../documentElements.js";
import { mapName, mapTemplate, mapColor, showOutline, stateButtonsPanel, mapContainer, svg, mapOutline, loadingScreen, selectedList, createForm } from "./documentElements-create.js";
import { SVG_WIDTH, SVG_HEIGHT, SVG_PADDING } from "../variables.js";
import ParentChildMap from "../models/ParentChildMap.js";

let regionTypes;
let selectedType = "enabled";

window.onload = async () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Create";
    navBar.appendChild( pageName );

    await APIClient.getMaps( "map_id > 0", "map_id" ).then( maps => {
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
    regionTypes = await APIClient.getMapRegionStates();
    regionTypes.push("deselect");
}

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
/** @type {ParentChildMap} */
let regionMap;
mapTemplate.addEventListener('change', async e => {
    mapOutline.style.display = "none";
    selectedList.style.display = "none";
    mapContainer.style.display = "none";
    stateButtonsPanel.style.display = "none";
    for ( const region of svg.querySelectorAll( "PATH" ) ) {
        region.remove();
    }
    if ( mapTemplate.value >= 0 ) {
        // Get the chosen map and display it
        map = new MMap( await APIClient.getMapById( mapTemplate.value ) );
        regionMap = await populateSVG( map, svg );
        for ( const path of svg.querySelectorAll('PATH') ) {
            path.addEventListener('mouseover', mouse => {
                if ( mouse.button === 0 && dragging ) {
                    changeRegionType( mouse );
                }
            });
        }
        stateButtonsPanel.style.display = "flex";
        mapContainer.style.display = "flex";
    }
});

svg.addEventListener('mousedown', mouse => {
    dragging = true;
    if ( mouse.button === 0 && mouse.target.tagName === "path" ) {
        changeRegionType( mouse );
    }
});
// Right click to zoom, Escape to unzoom
svg.addEventListener( 'contextmenu', e => {
    e.preventDefault();
    zoom( e, svg );
});

document.addEventListener('mouseup', e => {
    dragging = false;
    if ( createUtil.getCenteredRegions().length > 0 ) {
        displaySelection();
        if ( showOutline.checked ) {
            createUtil.createOutline();
            mapOutline.style.display = "block";
        }
    }
});

showOutline.addEventListener('change', e => {
    if ( showOutline.checked && createUtil.getCenteredRegions().length ) {
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
    const region = mouse.target;
    // Remove existing class from the region and add the new one
    region.classList.remove( region.classList[0] )
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
            const regions = svg.querySelectorAll(`PATH.${type}`);
            if ( regions.length ) {
                // Create type header
                const h3 = document.createElement('H3');
                h3.textContent = util.capitalizeFirst( type );
                selectedList.appendChild(h3);
                // Add regions to its parent's list
                regions.forEach( pathElement => {
                    let parentGroupId = pathElement.parentElement.parentElement.id;
                    // If this parent doesnt yet have any selected regions, initialize its array
                    sort[parentGroupId] = sort[parentGroupId] ? sort[parentGroupId].concat( pathElement.id ) : [pathElement.id];
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
    }
    
    // If no regions are selected, hide container
    if ( selectedList.innerHTML === "" ) selectedList.style.display = "none";
}

createForm.addEventListener('submit', async e => {
    e.preventDefault();
    if ( mapName.value && mapTemplate.value && svg.querySelectorAll('PATH.enabled').length > 1 ) {
        loadingScreen.style.display = "flex";
        // console.log( e.target.elements[3].files[0] ); return;
        await createCustomMap( e ).then( map => {
            document.location = "../";
        }).catch( err => {
            console.error( err );
        });
    }
});

/**
 * 
 * @param {SubmitEvent} e 
 */
async function createCustomMap( e ) {
    let thumbnail;
    await APIClient.uploadThumbnail( e.target ).then( async res => {
        thumbnail = ( res.status === 400 ) ? "default/Test_Map_Thumbnail.png" : ( await res.json() ).filename;
    }).catch( err => {
        console.error( err );
    });
    const mapData = new MMap({
        map_id : null,
        map_name : mapName.value,
        map_thumbnail : thumbnail,
        map_primary_color_R : parseInt( mapColor.value.substr(1,2), 16 ),
        map_primary_color_G : parseInt( mapColor.value.substr(3,2), 16 ),
        map_primary_color_B : parseInt( mapColor.value.substr(5,2), 16 ),
        map_is_custom : 1
    });
    await APIClient.createMap( mapData ).catch( err => {
        console.error( err );
    });

    // Find min and max X & Y values
    const minMax = createUtil.findMinMax();
    let mapMinX = minMax.mapMinX, mapMaxX = minMax.mapMaxX, mapMinY = minMax.mapMinY, mapMaxY = minMax.mapMaxY;

    // For each region type
    for ( const typeName of regionTypes ) {
        // For each selected region of this type
        for ( const pathElement of svg.querySelectorAll(`PATH.${typeName}`) ) {
            const parentId = pathElement.parentElement.parentElement.id;
            // Create the mapRegion
            const mapRegion = new MapRegion({
                mapRegion_map_id : mapData.map_id,
                mapRegion_region_id : regionMap.getChild( parentId, pathElement.id ),
                mapRegion_parent : util.idToInput( parentId ),
                mapRegion_offsetX : ( pathElement.getBBox().x - mapMinX ) / map.map_scale,
                mapRegion_offsetY : ( pathElement.getBBox().y - mapMinY ) / map.map_scale,
                mapRegion_scaleX : 1.0,
                mapRegion_scaleY : 1.0,
                mapRegion_type : typeName
            });
            await APIClient.createMapRegion( mapRegion ).then( returnedMapRegion => {}).catch( async err => {
                await APIClient.deleteMap( mapData.map_id ).then( res => {
                    console.log( "Map creation aborted, deleted all data." );
                    return;
                });
                console.error( err );
            });
        }
    }

    await APIClient.updateMap( mapData ).catch( err => {
        console.error( err );
    });
}

