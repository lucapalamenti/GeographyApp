import util from "./util.js";

import { html, tooltip, svg, input, selectParent, zoomSlider, showNames, endGameButton, gameEndPanel } from "./documentElements-game.js";
import { SVG_WIDTH, SVG_HEIGHT } from "./documentElements-game.js";

let gameEnded = false;
let tooltipActive = false;

/**
 * Returns a reference to the G element for the current region
 * @returns {HTMLElement}
 */
const queryCurrentRegion = () => { return svg.querySelector(`svg > #${currentPrompt.pID} #${currentPrompt.rID}`) };

/**
 * Pulses a given group element a color
 * @param {SVGGElement} group 
 * @param {String} color 
 * @param {Boolean} clickable 
 * @param {Number} hold
 * @param {Number} fade
 */
const regionDisappearTrigger = ( group, color, clickable, hold = 1000, fade = 1000 ) => {
    group.classList.remove('clickable');
    group.querySelectorAll('POLYGON').forEach( polygon => {
        polygon.style.transition = '';
        polygon.style.fill = color;
        // Hold for 'hold' milliseconds
        setTimeout( function() {
            polygon.style.transition = 'fill 1s ease';
            polygon.style.fill = '';
            // Fade out for 'fade' milliseconds
            setTimeout( function() {
                polygon.style.transition = '';
                if ( clickable && !gameEnded ) group.classList.add('clickable');
            }, fade );
        }, hold );
    });
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
 * Displays a label with the given group's name
 * @param {SVGGElement} group 
 * @param {Event} e 
 * @param {Boolean} center 
 * @param {Boolean} timeout 
 */
const showLabel = ( group, e, center, timeout ) => {
    const p = document.createElement('P');
    p.classList.add('clickLabel');
    p.textContent = util.idToInput( group.getAttribute('id') );
    if ( center ) {
        const rect = group.getBoundingClientRect();
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
 * Returns the number of regions to prompt the user with
 * @param {Map<String,Array>} regionMap 
 */
const getNumPrompts = ( regionMap ) => {
    let sum = 0;
    regionMap.forEach((regionNames, parent) => {
        sum += regionNames.length;
    });
    return sum;
};

/**
 * Randomly shuffles an array
 * @param {Map<String,Array>} regionMap 
 * @returns {Array<Object>} looks like [{pID : "parent_name", pInput : "Parent Name", rID : "region_name", rInput : "Region Input"},{...}]
 */
const shuffleRegionMap = ( regionMap ) => {
    const arr = [];
    // First add all [parent,region] pairs into the array
    // Value comes before Key in the Map.forEach() method
    regionMap.forEach(( regionNames, parent ) => {
        for ( const name of regionNames ) {
            arr.push({
                pID : parent,
                pinput : util.idToInput( parent ),
                rID : name,
                rInput : util.idToInput( name )
            });
        }
    });
    // Then shuffle the array
    for ( let i = arr.length - 1; i >= 0; i-- ) {
        const j = Math.floor( Math.random() * i );
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};

const getOrderedParents = ( regionMap ) => {
    const ordered = [];
    regionMap.forEach(( regionNames, parentName ) => {
        // Only select parents with regions of type "enabled"
        if ( svg.querySelector(`SVG > G#${parentName} G.enabled`) ) {
            ordered.push( parentName );
        }
    });
    return ordered.sort();
};

/**
 * Populates the Select dropdown for gamemodes that need it
 * @param {Map<String,Array<String>} regionMap 
 */
const populateSelect = ( regionMap ) => { 
    for ( const name of getOrderedParents( regionMap ) ) {
        const option = document.createElement('OPTION');
        option.value = name.toLowerCase();
        option.innerText = util.idToInput( name );
        selectParent.appendChild( option );
    }
    if ( regionMap.size === 1 ) {
        selectParent.selectedIndex = 1;
        selectParent.setAttribute('disabled', true);
    }
    selectParent.style.display = "block";
};

showNames.addEventListener('change', e => {
    // Show all names
    if ( e.target.checked ) {
        document.querySelectorAll('G').forEach( group => {
            if ( group.classList.contains('grey-out') ) return;
            showLabel( group, e, true, false );
        });
    }
    // Hide all names
    else {
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.parentNode.removeChild( label );
        });
    }
});

// Right click to zoom
svg.addEventListener( 'contextmenu', e => { e.preventDefault(); });
svg.addEventListener( 'contextmenu', zoom );
function zoom( e ) {
    const zoomLevel = zoomSlider.value * 10;
    document.querySelectorAll('.clickLabel').forEach( label => {
        label.style.display = "none";
    });
    const rect = svg.getBoundingClientRect();
    // X coordinate of zoom viewport
    let startX = ( e.clientX - rect.left ) * SVG_WIDTH / rect.width - SVG_WIDTH / zoomLevel;
    // Y coordinate of zoom viewport
    let startY = ( e.clientY - rect.top ) * SVG_HEIGHT / rect.height - SVG_HEIGHT / zoomLevel;
    // Adjust so zoom is not greater than original viewport
    const ratioX = SVG_WIDTH * ( 1 - 2 / zoomLevel );
    const ratioY = SVG_HEIGHT * ( 1 - 2 / zoomLevel );
    startX = startX < 0 ? 0 : ( startX > ratioX ) ? ratioX : startX;
    startY = startY < 0 ? 0 : ( startY > ratioY ) ? ratioY : startY;

    svg.setAttribute('viewBox', `${startX} ${startY} ${ SVG_WIDTH / zoomLevel * 2 } ${ SVG_HEIGHT / zoomLevel * 2 }`);
    svg.classList.add(`zoom-${zoomSlider.value}`);
    svg.removeEventListener( 'contextmenu', zoom );
    zoomSlider.setAttribute( 'disabled', true );
    showNames.setAttribute( 'disabled', true );
    showNames.checked = false;

    // Escape key to unzoom
    document.addEventListener( 'keydown', unzoom );
    input.focus();
};
// Escape to unzoom
function unzoom( e ) {
    if ( e.key === 'Escape' ) {
        svg.classList.remove(`zoom-${zoomSlider.value}`);
        svg.setAttribute('viewBox', "0 0 1600 900");
        svg.addEventListener( 'contextmenu', zoom );
        document.querySelectorAll('.clickLabel').forEach( label => {
            label.style.display = "none";
        });
        zoomSlider.removeAttribute( 'disabled' );
        showNames.removeAttribute( 'disabled' );
        document.removeEventListener( 'keydown', unzoom );
        input.focus();
    }
};

endGameButton.addEventListener('click', e => {
    for ( const group of svg.querySelectorAll('g g g:not(.guesses0, .guesses1, .guesses2, .guesses3)') ) {
        group.classList.remove('clickable');
        group.classList.add('inactive');
    }
    endGame();
});

/**
 * Run when finishing a game
 */
const endGame = () => {
    gameEnded = true;
    document.getElementById('bottom-game-bar').style.display = "none";
    input.setAttribute('disabled', true);
    html.classList.add('filter-dark');
    gameEndPanel.style.display = "flex";
    for ( const label of document.querySelectorAll('.click-on') ) {
        label.textContent = "-";
    }
    // Reappear colors at the end
    svg.classList.add("showGuesses");
    console.log( "YOU WIN!" );
}

export default {
    queryCurrentRegion,
    regionDisappearTrigger,
    pulseElementBG,
    showLabel,
    moveToolTip,
    enableTooltip,
    getNumPrompts,
    shuffleRegionMap,
    getOrderedParents,
    populateSelect,
    endGame
}