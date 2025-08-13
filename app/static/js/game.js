import APIClient from "./APIClient.js";
import { gamemodeMap } from "./gamemodes.js";
import populateSVG from "./populateSVG.js";

const query = window.location.search;
let parameters = new URLSearchParams( query );
const map_id = Number( parameters.get('mapId') );

const html = document.querySelector('HTML');
const svg = document.querySelector('SVG');
const navBar = document.getElementById('nav-bar');
const gamemodePanel = document.getElementById('gamemode-panel');
const selectButton = gamemodePanel.querySelector('NAV .btn-green');
const gameEndPanel = document.getElementById('game-end-panel');
const playAgainButton = gameEndPanel.querySelector('NAV .btn-green');
const homeButton = gameEndPanel.querySelector('NAV .btn-grey');
const bottomGameBar = document.getElementById('bottom-game-bar');

let map;
// Update header bar
await APIClient.getMapById( map_id ).then( returnedMap => {
    map = returnedMap;
    document.querySelector('TITLE').textContent = returnedMap.map_name;
    const nextLink = document.createElement('A');
    nextLink.href = '/game?mapId=' + map_id;
    nextLink.textContent = returnedMap.map_name;
    navBar.appendChild( nextLink );
    const arrow = document.createElement('STRONG');
    arrow.textContent = '>';
    navBar.appendChild( arrow );
}).catch( err => {
    console.error( err );
});

// Store the names of all regions for the current map and show them on the map
// ( await is necessary here even though vscode says otherwise )
const regionMap = await populateSVG( map, svg );

let currentGamemode = null;
selectButton.addEventListener('click', () => {
    const gmInput = document.querySelector('INPUT[name="gamemode"]:checked');
    // If a gamemode radio button has been selected
    if ( gmInput ) {
        html.classList.remove('filter-dark');
        currentGamemode = gmInput.value;
        gamemodePanel.style.visibility = "hidden";
        gamemodePanel.style.cursor = "default";
        bottomGameBar.style.display = "flex";
        APIClient.getRegionParentsForMap( map_id ).then( parents => {
            // Call the method for the selected gamemode
            gamemodeMap[currentGamemode]( regionMap );
            const gamemodeLabel = document.createElement('P');
            gamemodeLabel.textContent = currentGamemode;
            navBar.appendChild( gamemodeLabel );
        });
    }
});

playAgainButton.addEventListener('click', () => {
    location.reload();
});

homeButton.addEventListener('click', () => {
    document.location = '../';
});

