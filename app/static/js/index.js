import APIClient from './APIClient.js';

// Populates map buttons on screen from database
await APIClient.getMaps().then( returnedMaps => {
    const mapNavigation = document.getElementById('map-navigation');
    const mapButtonTemplate = document.getElementById('map-button-template');
    returnedMaps.forEach( map => {
        const mapButtonInstance = mapButtonTemplate.content.cloneNode(true);
        const mapButtonElement = mapButtonInstance.querySelector('.map-button-container');

        const mapButtonLabel = mapButtonElement.querySelector('.map-button-label');
        const mapButtonTop = mapButtonElement.querySelector('.map-button-top');
        const mapButtonBottom = mapButtonElement.querySelector('.map-button-bottom');

        mapButtonElement.href = '/game?mapId=' + map.map_id;
        mapButtonElement.style["background-image"] = `url('../images/${map.map_thumbnail}')`;
        mapButtonBottom.style["background-color"] = `rgba(${map.map_primary_color},0.5)`;
        // mapButtonBottom.style["background-color"] = `rgb(${map.map_primary_color})`;
        mapButtonTop.style["background-image"] = `linear-gradient( to top, rgba(${map.map_primary_color},0.5), rgba(${map.map_primary_color},0)`;
        mapButtonLabel.textContent = map.map_name;

        mapNavigation.appendChild(mapButtonElement);
    });
}).catch(err => {
    console.error(err);
});