import APIClient from "./APIClient.js";
import { gamemodeMap } from "./gamemodes.js";
import populateSVG from "./populateSVG.js";

const query = window.location.search;
let parameters = new URLSearchParams( query );
const map_id = Number( parameters.get('mapId') );

const svg = document.querySelector('SVG');
const gamemodePanel = document.getElementById('gamemode-panel');
const selectButton = gamemodePanel.querySelector('NAV .btn-green');
const gameEndPanel = document.getElementById('game-end-panel');
const playAgainButton = gameEndPanel.querySelector('NAV .btn-green');
const homeButton = gameEndPanel.querySelector('NAV .btn-grey');
const covering = document.getElementById('covering');

document.getElementById('b1').addEventListener('click', () => {
    //APIClient.custom();
    APIClient.printShapeInsertQuery().then( r => {
    }).catch( err => {
        console.error( err );
    });
});

let map;
// Update header bar
await APIClient.getMapById( map_id ).then( returnedMap => {
    map = returnedMap;
    document.querySelector('TITLE').textContent = returnedMap.map_name;
    const navBar = document.getElementById('nav-bar');
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

// Store the names of all shapes for the current map and show them on the map
// ( await is necessary here even though vscode says otherwise )
const shapeNames = await populateSVG( map, svg );

let currentGamemode = null;

selectButton.addEventListener('click', () => {
    const gmInput = document.querySelector('input[name="gamemode"]:checked');
    // If a gamemode radio button has been selected
    if ( gmInput ) {
        currentGamemode = gmInput.value;
        covering.style.visibility = "hidden";
        gamemodePanel.style.visibility = "hidden";
        gamemodePanel.style.cursor = "default";
        APIClient.getShapeParentsForMap( map_id ).then( parents => {
            gamemodeMap[currentGamemode]( Array.from( shapeNames ), parents );
        });
    }
});

playAgainButton.addEventListener('click', () => {
    location.reload();
});

homeButton.addEventListener('click', () => {
    document.location = '../';
});

