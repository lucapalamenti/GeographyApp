import util from "./util/util.js";

import { html, tooltip, svg, input, selectParent, showNames, endGameButton, gameEndPanel, noMapArea, promptTally } from "./documentElements-game.js";
import { SVG_WIDTH, SVG_HEIGHT, SVG_ZOOM_START, SVG_ZOOM_INC, SVG_MAX_ZOOMS } from "./variables.js";
import ParentChildMap from "./models/ParentChildMap.js";

const audioPath = "../audio/";

let gameEnded = false;
let tooltipActive = false;

/**
 * Returns a reference to the G element for the current region
 * @returns {HTMLElement}
 */
const queryCurrentRegion = ( currentPrompt ) => { return svg.querySelector(`SVG G#${currentPrompt.pID} G PATH#${currentPrompt.rID}`) };

const playSound = ( filename ) => { new Audio( `${audioPath}${filename}` ).play() };

const setGuessesColor = ( guesses ) => {
    // set css class given the number of guesses
    // maybe this can be different for the invisible gamemodes, idk
};

/**
 * Pulses a given path element a color
 * @param {SVGPathElement} group 
 * @param {String} color 
 * @param {Boolean} clickable 
 * @param {Number} hold
 * @param {Number} fade
 */
const regionDisappearTrigger = ( path, color, clickable, hold = 1000, fade = 1000 ) => {
    path.classList.remove('clickable');
    path.style.transition = '';
    path.style.fill = color;
    // Hold for 'hold' milliseconds
    setTimeout( function() {
        path.style.transition = 'fill 1s ease';
        path.style.fill = '';
        // Fade out for 'fade' milliseconds
        setTimeout( function() {
            path.style.transition = '';
            if ( clickable && !gameEnded ) path.classList.add('clickable');
        }, fade );
    }, hold );
};

/**
 * Pulses the background color of an element
 * @param {HTMLElement} element
 * @param {String} color the color to pulse to
 */
const pulseElementBG = ( element, colorOrig, colorPulse ) => {
    element.style.transition = '';
    element.style.backgroundColor = colorPulse;
    setTimeout(() => {
        element.style.transition = 'background-color 1s ease';
        element.style.backgroundColor = colorOrig;
        setTimeout(() => {
        }, 1000);
    }, 10 );
};

/**
 * Displays a label with the given path's name
 * @param {SVGPathElement} path 
 * @param {Event} e 
 * @param {Boolean} center 
 * @param {Boolean} timeout 
 */
const showLabel = ( path, e, center, timeout ) => {
    const p = document.createElement('P');
    p.classList.add('clickLabel');
    p.textContent = util.idToInput( path.getAttribute('id') );
    if ( center ) {
        const rect = path.getBoundingClientRect();
        p.style.transform = `translate( calc( -50% + ${rect.left + rect.width / 2 + scrollX}px ), calc( -50% + ${rect.top + rect.height / 2 + scrollY}px ) )`;
    } else {
        p.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( -120% + ${e.clientY + window.scrollY}px ) )`;
    }
    p.addEventListener('contextmenu', e => { e.preventDefault() });
    tooltip.before( p );

    if ( timeout ) {
        // Show for 1.5 seconds
        setTimeout( function() {
            tooltip.parentNode.removeChild( p );
        }, 1500 );
    }
};

/**
 * Moves tooltip with cursor
 * @param {Event} e 
 */
const moveToolTip = ( e ) => {
    tooltip.style.display = "block";
    tooltip.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( 60% + ${e.clientY + window.scrollY}px ) )`;
}

/**
 * Enables the tooltip to follow mouse
 */
const enableTooltip = () => {
    if ( !tooltipActive ) {
        tooltipActive = true;
        svg.addEventListener('mousemove', moveToolTip);
        svg.addEventListener('scroll', moveToolTip);
        svg.addEventListener('mouseout', e => {
            tooltip.style.display = "none" ;
        });
    }
}

/**
 * Randomly shuffles an array
 * @param {ParentChildMap} regionMap 
 * @returns {Array<Object>} looks like [{pID : "parent_name", pInput : "Parent Name", rID : "region_name", rInput : "Region Input"},{...}]
 */
const shuffleRegionMap = ( regionMap ) => {
    const arr = [];
    // First add all [parent,region] pairs into the array
    for ( const parentName of regionMap.getParentNames() ) {
        for ( const childName of regionMap.getChildNames( parentName ) ) {
            arr.push({
                pID : parentName,
                pinput : util.idToInput( parentName ),
                rID : childName,
                rInput : util.idToInput( childName )
            });
        }
    }
    // Then shuffle the array
    for ( let i = arr.length - 1; i >= 0; i-- ) {
        const j = Math.floor( Math.random() * (i + 1) );
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};

/**
 * 
 * @param {ParentChildMap} regionMap 
 * @returns {Array<String>}
 */
const getOrderedParents = ( regionMap ) => {
    const ordered = [];
    for ( const parentName of regionMap.getParentNames() ) {
        // If this parent has "enabled" regions
        if ( svg.querySelector(`SVG > G#${parentName} > G.enabled PATH`) ) {
            ordered.push( parentName );
        }
    }
    return ordered.sort();
};

/**
 * Populates the Select dropdown for gamemodes that need it
 * @param {ParentChildMap} regionMap 
 */
const populateSelect = ( regionMap ) => {
    const orderedParents = getOrderedParents( regionMap );
    for ( const name of orderedParents ) {
        const option = document.createElement('OPTION');
        option.value = name.toLowerCase();
        option.innerText = util.idToInput( name );
        selectParent.appendChild( option );
    }
    // Auto select the parent if there is only one with enabled regions
    if ( orderedParents.length === 1 ) {
        selectParent.selectedIndex = 1;
        selectParent.setAttribute('disabled', true);
    }
};

showNames.addEventListener('change', e => {
    // Show all names
    if ( e.target.checked ) {
        document.querySelectorAll('PATH').forEach( path => {
            if ( path.classList.contains('grey-out') ) return;
            showLabel( path, e, true, false );
        });
    }
    // Hide all names
    else {
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.parentNode.removeChild( label );
        });
    }
});

/**
 * Populates all cells in the table with the formatted version of their id
 */
function fillTable() {
    for ( const cell of noMapArea.querySelectorAll('P') ) {
        cell.textContent = util.idToInput( cell.id );
    }
}

// Right click to zoom
svg.addEventListener( 'contextmenu', e => { e.preventDefault(); });
svg.addEventListener( 'contextmenu', zoom );
let zoomLevel = SVG_ZOOM_START;
function zoom( e ) {
    // Only allow if you are not too far zoomed in
    if ( zoomLevel <= SVG_ZOOM_START + SVG_ZOOM_INC * SVG_MAX_ZOOMS ) {
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.style.display = "none";
        });
        const currentVB = svg.getAttribute('viewBox').split(' ').map( value => Number(value) );
        const rect = svg.getBoundingClientRect();
        // X coordinate of zoom viewport
        let startX = currentVB[0] + ( e.clientX - rect.left ) * currentVB[2] / rect.width - currentVB[2] / zoomLevel;
        // Y coordinate of zoom viewport
        let startY = currentVB[1] + ( e.clientY - rect.top ) * currentVB[3] / rect.height - currentVB[3] / zoomLevel;
        // Adjust so zoom is not greater than original viewport
        const maxX = SVG_WIDTH * sumZooms();
        const maxY = SVG_HEIGHT * sumZooms();
        startX = startX < 0 ? 0 : ( startX > maxX ) ? maxX : startX;
        startY = startY < 0 ? 0 : ( startY > maxY ) ? maxY : startY;

        svg.setAttribute('viewBox', `${startX} ${startY} ${ currentVB[2] / zoomLevel * 2 } ${ currentVB[3] / zoomLevel * 2 }`);
        showNames.setAttribute( 'disabled', true );
        showNames.checked = false;

        // Escape key to unzoom
        document.addEventListener( 'keydown', unzoom );
        input.focus();
        zoomLevel += SVG_ZOOM_INC;
    }
};
// Escape to unzoom
function unzoom( e ) {
    if ( e.key === 'Escape' ) {
        svg.setAttribute('viewBox', "0 0 1600 900");
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.style.display = "none";
        });
        showNames.removeAttribute( 'disabled' );
        document.removeEventListener( 'keydown', unzoom );
        input.focus();
        zoomLevel = SVG_ZOOM_START;
    }
};
function sumZooms() {
    let i = zoomLevel;
    let rtn = 0;
    while ( i >= SVG_ZOOM_START ) {
        rtn += ( 1 - 2 / i );
        i -= SVG_ZOOM_INC;
    }
    return rtn;
}

/**
 * Run when finishing a game
 */
const endGame = () => {
    gameEnded = true;
    for ( const path of svg.querySelectorAll('G G PATH:not(.guesses0, .guesses1, .guesses2, .guesses3)') ) {
        path.classList.remove('clickable');
    }
    svg.parentElement.style.display = "block";
    document.getElementById('bottom-game-bar').style.display = "none";
    input.setAttribute('disabled', true);
    html.classList.add('filter-dark');
    promptTally.style.display = "none";
    gameEndPanel.style.display = "flex";
    for ( const label of document.querySelectorAll('.click-on') ) {
        label.textContent = "-";
    }
    fillTable();
    // Reappear colors at the end
    svg.classList.remove("invisible-mode");
    svg.classList.remove("invisible-mode-hard");
    svg.classList.add("showGuesses");
    svg.classList.add('gameEnd');
    console.log( "YOU WIN!" );
}
endGameButton.addEventListener('click', endGame);

export default {
    queryCurrentRegion,
    playSound,
    regionDisappearTrigger,
    pulseElementBG,
    showLabel,
    moveToolTip,
    enableTooltip,
    shuffleRegionMap,
    getOrderedParents,
    populateSelect,
    endGame
}