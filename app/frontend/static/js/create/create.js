import APIClient from "../APIClient.js";
import populateSVG from "../populateSVG.js";
import createUtil from "./createUtil.js";

import MMap from "../models/MMap.js";

import { navBar } from "../documentElements.js";
import { mapName, mapTemplate, mapColor, mapThumbnail, setRegionTypePanel, modificationButtonsPanel, mapContainer, svg, mapOutline, loadingScreen, selectedList, createForm } from "./documentElements-create.js";
import ParentChildMap from "../models/ParentChildMap.js";
import mapInteraction from "./mapInteraction.js";

/** @type {Array<string>} */
globalThis.regionTypes = [];
/** @type {MMap} */
let map;
/** @type {ParentChildMap} */
let regionMap;

window.onload = async () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Create";
    navBar.appendChild( pageName );
    modificationButtonsPanel.style.visibility = "hidden";

    await APIClient.getMaps( "template", undefined, false ).then( maps => {
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
}

mapTemplate.addEventListener('change', async e => {
    mapOutline.style.visibility = "hidden";
    selectedList.style.display = "none";
    if ( mapTemplate.value >= 0 ) {
        // Get the chosen map and display it
        map = new MMap( await APIClient.getMapById( mapTemplate.value ) );
        regionMap = await populateSVG( map, svg );
        for ( const path of svg.querySelectorAll("PATH") ) {
            path.classList.add( "invisible" );
        }
        svg.appendChild( mapOutline );
        mapInteraction.addRegionEventListeners();
        modificationButtonsPanel.style.visibility = "visible";
        mapContainer.hidden = false;
    } else {
        modificationButtonsPanel.style.visibility = "hidden";
        setRegionTypePanel.style.display = "none";
        mapContainer.hidden = true;
    }
    mapInteraction.updateBtnSelection( document.getElementById("set-region-type-btn") );
});

createForm.addEventListener('submit', async e => {
    e.preventDefault();
    if ( createUtil.readyToCreate() ) {
        loadingScreen.style.display = "flex";
        await createMap( e ).then( () => {
            document.location = "../";
        }).catch( err => {
            loadingScreen.style.display = "none";
            console.error( err );
        });
    }
});

/**
 * Handles database queries for map creation
 * @param {SubmitEvent} e 
 */
async function createMap( e ) {
    // Create thumbnail file
    let thumbnail = "default/Test_Map_Thumbnail.png";
    if ( mapThumbnail.files.length === 1 ) {
        await APIClient.uploadThumbnail( e.target ).then( async res => {
            res = await res.json();
            thumbnail = res.filename;
        });
    }
    
    // Create Map
    const mapData = await APIClient.createMap({
        map_id : null,
        map_name : mapName.value,
        map_thumbnail : thumbnail,
        map_primary_color_R : parseInt( mapColor.value.substring(1,2), 16 ),
        map_primary_color_G : parseInt( mapColor.value.substring(3,2), 16 ),
        map_primary_color_B : parseInt( mapColor.value.substring(5,2), 16 ),
        map_is_template : 0,
        map_is_custom : 1
    });

    // Create MapRegion join data for each region type
    for ( const typeName of regionTypes ) {
        for ( const pathElement of svg.querySelectorAll(`PATH.${typeName}`) ) {
            // Create the mapRegion
            /** @type {import('../typeDefs/Types.js').MapRegionJoinData} */
            const mapRegion = {
                mapRegion_map_id : mapData.map_id,
                mapRegion_region_id : regionMap.getChild( pathElement.parentElement.parentElement.id, pathElement.id ),
                mapRegion_type : typeName
            };
            await APIClient.createMapRegion( mapRegion ).catch( err => {
                console.error( err );
            });
        }
    }
}
