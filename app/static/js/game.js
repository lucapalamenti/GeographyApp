import APIClient from './APIClient.js';
import { gamemodeMap } from './gamemodes.js';

const query = window.location.search;
let parameters = new URLSearchParams( query );
const map_id = Number( parameters.get('mapId') );

const svg = document.querySelector('SVG');
const selectButton = document.getElementById('btn-select');
const cancelButton = document.getElementById('btn-cancel');
const gamemodePanel = document.getElementById('gamemodePanel');
const covering = document.getElementById('covering');

// Update header bar
await APIClient.getMapById( map_id ).then( returnedMap => {
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

// Will store the names of all shapes for the current map
const shapeNames = new Set();

// Load shapes for the current map onto the screen
await APIClient.getShapesByMapId( map_id ).then( returnedShapes => {
    returnedShapes.forEach( shape => {
        const polygon = document.getElementById('polygon-template').content.cloneNode( true ).querySelector('POLYGON');
        polygon.setAttribute('class', shape.shape_name.split(' ').join('_'));
        polygon.setAttribute('points', shape.shape_points);
        svg.appendChild( polygon );
        shapeNames.add( shape.shape_name );
        polygon.addEventListener('mouseover', () => {
            document.querySelectorAll(`.${polygon.classList[0]}`).forEach(eWithSameClass => {
                if ( polygon.classList.length === 1 ) {
                    eWithSameClass.style.fill = "rgb(210, 211, 117)";
                }
            });
        });
        polygon.addEventListener('mousedown', () => {
            document.querySelectorAll(`.${polygon.classList[0]}`).forEach(eWithSameClass => {
                if ( polygon.classList.length === 1 ) {
                    eWithSameClass.style.fill = "rgb(190, 191, 97)";
                }
            });
        });
        polygon.addEventListener('mouseup', () => {
            document.querySelectorAll(`.${polygon.classList[0]}`).forEach(eWithSameClass => {
                if ( polygon.classList.length === 1 ) {
                    eWithSameClass.style.fill = "rgb(210, 211, 117)";
                }
            });
        });
        polygon.addEventListener('mouseout', () => {
            document.querySelectorAll(`.${polygon.classList[0]}`).forEach(eWithSameClass => {
                if ( polygon.classList.length === 1 ) {
                    eWithSameClass.style.fill = "";
                }
            });
        });
    });
}).catch( err => {
    console.error( err );
});

let currentGamemode = null;

selectButton.addEventListener('click', () => {
    const gmInput = document.querySelector('input[name="gamemode"]:checked');
    // If a gamemode radio button has been selected
    if ( gmInput ) {
        currentGamemode = gmInput.value;
        covering.style.visibility = "hidden";
        gamemodePanel.style.visibility = "hidden";
        gamemodePanel.style.cursor = "default";
        gamemodeMap[currentGamemode]( Array.from( shapeNames ) );
    }
});

cancelButton.addEventListener('click', () => {
    // If no gamemode is selected, go back to previous page
    if ( !currentGamemode ) {
        document.location = '../';
    }
});