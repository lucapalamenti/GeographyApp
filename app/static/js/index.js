import APIClient from "./APIClient.js";

const mapSection = document.getElementById('map-section');
const mapNavigation = document.getElementById('map-navigation');
const deleteMapButton = document.getElementById('delete-map-btn');
const deleteAllMapsButton = document.getElementById('delete-all-maps-btn');
const filterMapsSelect = document.getElementById('filter-maps');
const sortMapsSelect = document.getElementById('sort-maps');

// Populate screen with map buttons
await populateMaps( getSelectedFilter(), getSelectedSort() );

/**
 * Retrieves maps from the database given given a table header to sort by
 * @param {String} orderBy SQL query to ORDER BY
 */
async function populateMaps( where, orderBy ) {
    // First empty the map navigation container
    mapNavigation.innerHTML = "";
    await APIClient.getMaps( where, orderBy ).then( returnedMaps => {
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
            mapButtonElement.style["background-image"] = `url('../images/thumbnails/${map.map_thumbnail}'), url('../images/thumbnails/Test_Map_Thumbnail.png')`;
            mapButtonLabel.textContent = map.map_name;
            mapButtonTop.style["background-image"] = `linear-gradient( to top, rgba(${map.map_primary_color_R},${map.map_primary_color_G},${map.map_primary_color_B},0.5), rgba(${map.map_primary_color_R},${map.map_primary_color_G},${map.map_primary_color_B},0))`;
            mapButtonBottom.style["background-color"] = `rgba(${map.map_primary_color_R},${map.map_primary_color_G},${map.map_primary_color_B},0.5)`;

            mapNavigation.appendChild(mapButtonElement);
        }
    }).catch(err => {
        console.error(err);
    });
}

function getSelectedFilter() {
    return filterMapsSelect.options[filterMapsSelect.selectedIndex].value;
}
function getSelectedSort() {
    return sortMapsSelect.options[sortMapsSelect.selectedIndex].value;
}

filterMapsSelect.addEventListener('change', async option => {
    await populateMaps( option.target.value, getSelectedSort() );
});
sortMapsSelect.addEventListener('change', async option => {
    await populateMaps( getSelectedFilter(), option.target.value );
});

/* ----- Code related to deleting maps ----- */

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
            await APIClient.deleteMap( Number( node.id ) ).then( mapsDeleted => {
                window.location.reload();
            });
        }
    }
});

deleteAllMapsButton.addEventListener('click', async e => {
    await APIClient.deleteAllCustomMaps().then( deletedMaps => {
        window.location.reload();
    });
});

// The button that says OOOOOOOO
const btn = document.getElementById('b1');

btn.addEventListener('click', async e => {
    const allRegions = await APIClient.getRegions();
    console.log( allRegions );
});