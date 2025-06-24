import APIClient from "./APIClient.js";

const mapSection = document.getElementById('map-section');
const mapNavigation = document.getElementById('map-navigation');
const deleteMapButton = document.getElementById('delete-map-btn');

// Populate screen with map buttons
await APIClient.getMaps("map_id").then( returnedMaps => {
    const mapButtonTemplate = document.getElementById('map-button-template');
    for ( const map of returnedMaps ) {
        const mapButtonInstance = mapButtonTemplate.content.cloneNode(true);
        const mapButtonElement = mapButtonInstance.querySelector('.map-button-container');

        const mapButtonLabel = mapButtonElement.querySelector('.map-button-label');
        const mapButtonTop = mapButtonElement.querySelector('.map-button-top');
        const mapButtonBottom = mapButtonElement.querySelector('.map-button-bottom');

        if ( map.map_is_custom ) mapButtonElement.classList.add("custom-map");

        mapButtonElement.id = map.map_id;
        mapButtonElement.href = '/game?mapId=' + map.map_id;
        mapButtonElement.style["background-image"] = `url('../images/thumbnails/${map.map_thumbnail}'), url('../images/Test_Map_Thumbnail.png')`;
        mapButtonLabel.textContent = map.map_name;
        mapButtonTop.style["background-image"] = `linear-gradient( to top, rgba(${map.map_primary_color},0.5), rgba(${map.map_primary_color},0))`;
        mapButtonBottom.style["background-color"] = `rgba(${map.map_primary_color},0.5)`;

        mapNavigation.appendChild(mapButtonElement);
    }
}).catch(err => {
    console.error(err);
});

/* Code related to deleting maps */

let inDeleteMode = false;

deleteMapButton.addEventListener('click', e => {
    if ( inDeleteMode ) {
        exitDeleteMode();
    } else {
        enterDeleteMode();
    } 
});

document.addEventListener('keydown', key => {
    if ( key.key === 'Escape' ) {
        if ( inDeleteMode ) exitDeleteMode();
    }
});

/** Puts the page in "Delete Map" mode */
function enterDeleteMode() {
    inDeleteMode = true;
    mapSection.classList.add("delete-toggle");
    deleteMapButton.textContent = "Cancel Delete";
}

/** Exits the page from "Delete Map" mode */
function exitDeleteMode() {
    inDeleteMode = false;
    mapSection.classList.remove("delete-toggle");
    deleteMapButton.textContent = "Delete Custom Map";
    // Unfocuses the button
    deleteMapButton.blur();
}

mapNavigation.addEventListener('click', async e => {
    if ( inDeleteMode ) {
        e.preventDefault();
        let node = e.target;
        // Iterate parents until map-button-container is reached
        while ( node.nodeName !== "A" && node.nodeName !== "NAV" ) {
            node = node.parentNode;
        }
        // Only if you click a custom map
        if ( node.classList.contains("custom-map") ) {
            // Delete the map
            await APIClient.deleteMap( Number( node.id ) ).then( mapsDeleted => {});
            window.location.reload();
        }
    }
});