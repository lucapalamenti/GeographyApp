import APIClient from './APIClient.js';

// Populates map buttons on screen from database
await APIClient.getMaps().then( returnedMaps => {
    const mapNavigation = document.getElementById('map-navigation');
    const mapButtonTemplate = document.getElementById('map-button-template');
    returnedMaps.forEach( map => {
        const mapButtonInstance = mapButtonTemplate.content.cloneNode(true);
        const mapButtonElement = mapButtonInstance.querySelector('.map-button-container');

        const mapButtonLabel = mapButtonElement.querySelector('.map-button-label');

        mapButtonElement.href = '/game?mapId=' + map.map_id;
        mapButtonElement.style["background-image"] = `url('../images/${map.map_thumbnail}')`;
        mapButtonLabel.textContent = map.map_name;

        mapNavigation.appendChild(mapButtonElement);
    });
}).catch(err => {
    console.error(err);
});