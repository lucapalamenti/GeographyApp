import APIClient from "../APIClient.js";
import populateSVG from "../populateSVG.js";
import createUtil from "./createUtil.js";

import MMap from "../models/MMap.js";

import { navBar } from "../documentElements.js";
import { mapName, mapTemplate, mapColor, mapThumbnail, showOutline, setRegionTypePanel, modificationButtonsPanel, mapContainer, svg, mapOutline, loadingScreen, selectedList, createForm } from "./documentElements-create.js";
import ParentChildMap from "../models/ParentChildMap.js";
import mapInteraction from "./mapInteraction.js";

/**
 * @type {Array<string>}
 */
globalThis.regionTypes = [];
/**
 * @type {"selecting" | "moving" | "setting"}
 */
globalThis.option = "selecting";

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
    regionTypes.push("invisible");
}

let map;
/** @type {ParentChildMap} */
let regionMap;

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
    globalThis.option = "selecting";
});

showOutline.addEventListener('change', e => {
    if ( showOutline.checked && createUtil.getCenteredRegions().length ) {
        mapOutline.style.visibility = "visible";
    } else {
        mapOutline.style.visibility = "hidden";
    }
});

createForm.addEventListener('submit', async e => {
    e.preventDefault();
    if ( mapName.value && mapTemplate.value && svg.querySelectorAll('PATH.enabled').length > 1 ) {
        loadingScreen.style.display = "flex";
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
    let thumbnail = "default/Test_Map_Thumbnail.png";
    if ( mapThumbnail.files.length === 1 ) {
        await APIClient.uploadThumbnail( e.target ).then( async res => {
            res = await res.json();
            thumbnail = res.filename;
        });
    }
    
    const mapData = new MMap({
        map_id : null,
        map_name : mapName.value,
        map_thumbnail : thumbnail,
        map_primary_color_R : parseInt( mapColor.value.substr(1,2), 16 ),
        map_primary_color_G : parseInt( mapColor.value.substr(3,2), 16 ),
        map_primary_color_B : parseInt( mapColor.value.substr(5,2), 16 ),
        map_is_template : 0,
        map_is_custom : 1
    });
    // Create Map
    await APIClient.createMap( mapData ).then( returnedMap => {
        // Update map_id using retrieved Map
        mapData.map_id = returnedMap.map_id
    });

    // For each region type
    for ( const typeName of regionTypes.filter( t => t !== "invisible" ) ) {
        // For each selected region of this type
        for ( const pathElement of svg.querySelectorAll(`PATH.${typeName}`) ) {
            const parentId = pathElement.parentElement.parentElement.id;
            // Create the mapRegion
            /** @type {import('../typeDefs/Types.js').MapRegionJoinData} */
            const mapRegion = {
                mapRegion_map_id : mapData.map_id,
                mapRegion_region_id : regionMap.getChild( parentId, pathElement.id ),
                mapRegion_type : typeName
            };
            await APIClient.createMapRegion( mapRegion ).then( returnedMapRegion => {}).catch( async err => {
                // await APIClient.deleteMap( mapData.map_id ).then( res => {
                //     console.log( "Map creation aborted, deleted all data." );
                //     return;
                // });
                console.error( err );
            });
        }
    }

    await APIClient.updateMap( mapData ).catch( err => {
        console.error( err );
    });
}
