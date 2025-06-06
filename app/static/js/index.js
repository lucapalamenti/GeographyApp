import APIClient from "./APIClient.js";

const mapSection = document.getElementById('map-section');
const mapNavigation = document.getElementById('map-navigation');
const deleteMapButton = document.getElementById('delete-map-btn');

// Populates map buttons on screen from database
await APIClient.getMaps("map_id").then( returnedMaps => {
    const mapButtonTemplate = document.getElementById('map-button-template');
    for ( const map of returnedMaps ) {
        const mapButtonInstance = mapButtonTemplate.content.cloneNode(true);
        const mapButtonElement = mapButtonInstance.querySelector('.map-button-container');

        const mapButtonLabel = mapButtonElement.querySelector('.map-button-label');
        const mapButtonTop = mapButtonElement.querySelector('.map-button-top');
        const mapButtonBottom = mapButtonElement.querySelector('.map-button-bottom');

        if ( map.map_is_custom ) mapButtonElement.classList.add("custom-map");

        mapButtonElement.id = `map-${map.map_id}`;
        mapButtonElement.href = '/game?mapId=' + map.map_id;
        mapButtonElement.style["background-image"] = `url('../images/${map.map_thumbnail}'), url('../images/Test_Map_Thumbnail.png')`;
        mapButtonBottom.style["background-color"] = `rgba(${map.map_primary_color},0.5)`;
        mapButtonTop.style["background-image"] = `linear-gradient( to top, rgba(${map.map_primary_color},0.5), rgba(${map.map_primary_color},0)`;
        mapButtonLabel.textContent = map.map_name;

        mapNavigation.appendChild(mapButtonElement);
    }
}).catch(err => {
    console.error(err);
});

let toggle = false;
deleteMapButton.addEventListener('click', e => {
    toggle = !toggle;
    if ( toggle ) {
        mapSection.classList.add("delete-toggle");
        deleteMapButton.textContent = "Cancel Delete";
    } else {
        mapSection.classList.remove("delete-toggle");
        deleteMapButton.textContent = "Delete Custom Map";
    }
});
mapNavigation.addEventListener('click', async e => {
    if ( !toggle ) return;
    e.preventDefault();
    let node = e.target;
    while ( node.nodeName !== "A" && node.nodeName !== "SECTION" ) {
        node = node.parentNode;
    }
    if ( !node.classList.contains("custom-map") ) return;
    const map_id = Number( node.id.split("-")[1] );
    await APIClient.deleteMap( map_id ).then( mapsDeleted => {

    });
    window.location.reload();
});