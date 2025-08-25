import APIClient from "./APIClient.js";
import { gamemodeMap } from "./gamemodes.js";
import populateSVG from "./populateSVG.js";
import gameUtil from "./gameUtil.js";
import util from "./util.js";

import { html, svg, navBar, gamemodePanel, selectButton, gameEndPanel, playAgainButton, reviewMapButton, homeButton, bottomGameBar, tooltip } from "./documentElements-game.js";

const query = window.location.search;
let parameters = new URLSearchParams( query );
const map_id = Number( parameters.get('mapId') );

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

reviewMapButton.addEventListener('click', () => {
    svg.classList.add('reviewing');
    html.classList.remove('filter-dark');
    gameEndPanel.style.display = "none";
    gameUtil.enableTooltip();
    tooltip.removeChild( tooltip.firstChild );
    tooltip.style.fontWeight = "bold";
    svg.addEventListener('mousemove', e => {
        if ( e.target.tagName === "polygon" ) {
            tooltip.textContent = util.idToInput( e.target.parentElement.id );
            tooltip.style.display = "block" ;
        } else {
            tooltip.style.display = "none" ;
        }
    });
});

homeButton.addEventListener('click', () => {
    document.location = '../';
});

