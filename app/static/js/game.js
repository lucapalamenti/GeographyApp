import APIClient from './APIClient.js';
import { gamemodeMap } from './gamemodes.js';

const query = window.location.search;
let parameters = new URLSearchParams( query );
const map_id = Number( parameters.get('mapId') );
const svgPadding = 10;

const svg = document.querySelector('SVG');
const gamemodePanel = document.getElementById('gamemode-panel');
const selectButton = gamemodePanel.querySelector('NAV .btn-green');
const cancelButton = gamemodePanel.querySelector('NAV .btn-grey');
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

// Will store the names of all shapes for the current map
const shapeNames = new Set();

// Load shapes for the current map onto the screen
await APIClient.getShapesByMapId( map_id ).then( async returnedShapes => {
    const polygonTemplate = document.getElementById('polygon-template').content;
    for ( const region of returnedShapes ) {
        const regionId = `${region.mapShape_parent}__${region.mapShape_id}__${region.shape_name.split(' ').join('_').split("'").join('-').toLowerCase()}`;
        let group = svg.querySelector(`#a`);
        // If a group doesn't already exist for this shape's name
        if ( !group ) {
            // Create a new group
            group = polygonTemplate.cloneNode( true ).querySelector('G');
            // Remove empty polygon element
            group.innerHTML = "";
            group.setAttribute('id', regionId);
        }
        region.shape_points.coordinates.forEach( shape => {
            // Create a polygon for the current shape
            const p = polygonTemplate.cloneNode( true ).querySelector('POLYGON');
            const points = shape[0];
            // Convert each array index from [1,2] to "1,2" and apply scaling & offsets
            for ( let i = 0; i < points.length; i++ ) {
                let X = ( points[i][0] + Number( region.mapShape_offsetX ) ) * map.map_scale * region.mapShape_scaleX + svgPadding;
                let Y = ( points[i][1] + Number( region.mapShape_offsetY ) ) * map.map_scale * region.mapShape_scaleY + svgPadding;
                points[i] = `${X.toFixed(6)},${Y.toFixed(6)}`;
            }
            p.setAttribute('points', points.join(' ') );
            group.appendChild( p );
            svg.appendChild( group );
        });
        shapeNames.add( regionId );
    };
    if ( map_id === 3 || map_id === 48 ) virginiaFix();
    svg.classList.remove('hide-polygons');
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
        APIClient.getShapeParentsForMap( map_id ).then( parents => {
            gamemodeMap[currentGamemode]( Array.from( shapeNames ), parents );
        });
    }
});

cancelButton.addEventListener('click', () => {
    // If no gamemode is selected, go back to previous page
    if ( !currentGamemode ) {
        document.location = '../';
    }
});

playAgainButton.addEventListener('click', () => {
    location.reload();
});

homeButton.addEventListener('click', () => {
    document.location = '../';
});

/**
 * Moves Virginia cities to the bottom of the svg element so that they show up on
 * top of the counties that surround them
 */
function virginiaFix() {
    const arr = [];
    svg.querySelectorAll('G').forEach( group => {
        if ( group.id.endsWith( "_city" ) ) arr.push( svg.removeChild( group ) );
    });
    arr.forEach( group => {
        svg.append( group );
    });
}