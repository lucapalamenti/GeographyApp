import util from "./util/util.js";
import gameUtil from "./gameUtil.js";

import { svg, promptBar, input, promptLabel, noListArea, endGameButton, reviewMapButton, tally, promptTally, selectParent, showNames, noMapArea } from "./documentElements-game.js";
import { ATTEMPT_COLORS, REPEAT_COLOR, MAX_GUESSES, ATTEMPT_SOUNDS } from "./variables.js";
import ParentChildMap from "./models/ParentChildMap.js";

let promptsArr;
let currentPrompt = { pID : "", pInput : "", rID : "", rInput : "" };

let numPrompts = 0;
let promptNumber = 1;
let numCorrect = 0;
let guesses = 0;
let maxGuesses = MAX_GUESSES;
let invisible = false;

const pathOutlines = document.getElementById('pathOutlines');
const gTemplate = document.getElementById('svg-g-template').content;
const pathTemplate = document.getElementById('svg-path-template').content;

/**
 * Run the "Learn" gamemode
 */
function learn() {
    enableClicking();
    reviewMapButton.style.display = "none";
    promptLabel.textContent = "Click on a region to see its name";
    input.style.display = "none";
    promptBar.style.display = "flex";
    svg.addEventListener('click', e => {
        const group = e.target;
        if ( group.parentElement !== svg && svg.querySelector(`SVG > G G PATH#${group.id}`) ) {
            gameUtil.showLabel( group, e, true, true );
            gameUtil.regionDisappearTrigger( group, ATTEMPT_COLORS[0], true, 1000, 1000 );
            gameUtil.playSound( ATTEMPT_SOUNDS[1] );
        }
    });
}

/**
 * Run the "Click" gamemode
 * @param {ParentChildMap} regionMap 
 * @param {Boolean} disappear enable disappear mode
 */
function click ( regionMap, disappear ) {
    enableClicking();
    // Format top gamebar
    promptLabel.textContent = "Click on";
    input.style.display = "none";
    // Shuffle the prompts and display the first one on screen
    promptsArr = gameUtil.shuffleRegionMap( regionMap );
    currentPrompt = promptsArr.pop();
    updateLabels( regionMap, true );
    promptBar.style.display = "flex";
    // Setup tooltip to follow cursor
    gameUtil.enableTooltip();
    // In disappear mode remove showGuesses so that the region color changes back to default
    if ( disappear ) svg.classList.remove("showGuesses");
    svg.addEventListener('click', e => {
        const path = e.target;
        if ( path.classList.contains('clickable') ) {
            // Correct region clicked
            if ( path.getAttribute('id') === currentPrompt.rID ) {
                if ( guesses === 0 ) numCorrect++;
                gameUtil.playSound( ATTEMPT_SOUNDS[guesses] );
                next( path );
            }
            // Incorrect region clicked
            else {
                guesses++;
                gameUtil.regionDisappearTrigger( path, ATTEMPT_COLORS[3], true );
                gameUtil.playSound( ATTEMPT_SOUNDS[3] );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === maxGuesses ) {
                    const correctRegion = gameUtil.queryCurrentRegion( currentPrompt );
                    gameUtil.showLabel( correctRegion, e, true, true );
                    gameUtil.playSound( ATTEMPT_SOUNDS[4] );
                    next( correctRegion );
                }
            }
            gameUtil.showLabel( path, e, false, true );
        }
    });
    function next( path ) {
        // In disappear mode regions fade back to original color
        if ( disappear ) gameUtil.regionDisappearTrigger( path, ATTEMPT_COLORS[guesses], true );
        else path.classList.remove('clickable');
        
        path.classList.add(`guesses${guesses}`);
        currentPrompt = promptsArr.pop();
        // If there are no more prompts left
        if ( !currentPrompt )
            gameUtil.endGame();
        // Continue to next prompt
        else {
            promptNumber++;
            guesses = 0;
        }
        updateLabels( regionMap, true );
    }
}
/**
 * Run the "Click (Disappear)" gamemode
 * @param {ParentChildMap} regionMap 
 */
function clickDisappear ( regionMap ) {
    click( regionMap, true );
}
/**
 * Makes sure all regions that should be clickable have the class "clickable"
 */
function enableClicking() {
    selectParent.setAttribute('hidden', true);
    svg.querySelectorAll('G.enabled PATH, G.herring PATH').forEach( path => {
        path.classList.add('clickable');
    });
}

/**
 * Runs with all typing gamemodes
 * @param {ParentChildMap} regionMap 
 */
function typeGamemodes( regionMap ) {
    updateLabels( regionMap, false );
    promptBar.style.display = "flex";
    input.focus();
}
/**
 * Runs with all gamemodes that show the list
 * @param {ParentChildMap} regionMap 
 */
function listGamemodes( regionMap ) {
    for ( const parentName of gameUtil.getOrderedParents( regionMap ) ) {
        const h3 = document.createElement('H3');
        h3.textContent = util.idToInput( parentName );
        const div = document.createElement('DIV');
        div.setAttribute('id', parentName);
        for ( const childName of regionMap.getChildNames( parentName ) ) {
            const p = document.createElement('P');
            p.setAttribute('id', childName);
            div.appendChild( p );
        }
        noMapArea.appendChild( h3 );
        noMapArea.appendChild( div );
    }
}
/**
 * Runs the "Type" gamemode
 * @param {ParentChildMap} regionMap
 */
function type( regionMap ) {
    gameUtil.populateSelect( regionMap );
    typeGamemodes( regionMap );
    listGamemodes( regionMap );
    noMapArea.style.display = "flex";
    promptLabel.textContent = "Name all regions";
    promptTally.style.display = "none";

    input.addEventListener('keypress', e => {
        // If enter key is pressed
        if ( e.key === 'Enter' ) {
            // If input is valid
            if ( input.value !== "" && selectParent.value !== '' ) {
                // Initially set to 'incorrect' color
                let color = ATTEMPT_COLORS[3];
                const myInput = util.inputToId( input.value );
                // If the user input matches a region's name
                if ( regionMap.hasChild( selectParent.value, myInput ) ) {
                    color = REPEAT_COLOR;
                    const path = svg.querySelector(`G#${selectParent.value} G PATH#${CSS.escape( myInput )}`);
                    // The user has not yet typed this region
                    if ( !path.classList.contains('typed') ) {
                        // Update map
                        path.classList.add('typed');
                        path.classList.add('guesses0');
                        // Update list
                        const correctNode = noMapArea.querySelector(`#${selectParent.value} #${myInput}`);
                        correctNode.textContent = util.idToInput( myInput );
                        correctNode.style["background-color"] = "rgb(75, 255, 75)";
                        correctNode.style["border"] = "1px solid green";
                        input.value = "";
                        numCorrect++;
                        color = ATTEMPT_COLORS[0];
                        gameUtil.playSound( ATTEMPT_SOUNDS[0] );
                    }
                    // The user has already typed this region
                    else {
                        gameUtil.regionDisappearTrigger( path, REPEAT_COLOR, false, 0 );
                        gameUtil.pulseElementBG( noMapArea.querySelector(`#${selectParent.value} #${myInput}`), "rgb(75, 255, 75)", color );
                        gameUtil.playSound( ATTEMPT_SOUNDS[1] );
                    }
                } else {
                    gameUtil.playSound( ATTEMPT_SOUNDS[3] );
                }
                gameUtil.pulseElementBG( input, "white", color );
                updateLabels( regionMap, false );
                if ( numCorrect === numPrompts ) gameUtil.endGame();
            }
        }
    });
}
/**
 * Runs the "Type (Hard)" gamemode
 * @param {ParentChildMap} regionMap
 */
function typeHard( regionMap ) {
    promptLabel.textContent = "Name the highlighted region";
    selectParent.setAttribute('hidden', true);
    typeGamemodes( regionMap );
    promptsArr = gameUtil.shuffleRegionMap( regionMap );
    currentPrompt = promptsArr.pop();

    let currentGroup = gameUtil.queryCurrentRegion( currentPrompt );
    currentGroup.classList.add('typeCurrent');

    // Save parent so we can move currentGroup back
    let currentGParent;
    switchCurrent();

    input.addEventListener('keypress', e => {
        // If enter key is pressed
        if ( e.key === 'Enter' ) {
            // Only check if the value & parent arent blank
            if ( input.value !== '' ) {
                // If input is correct
                if ( input.value.toLowerCase() === currentPrompt.rInput.toLowerCase() ) {
                    gameUtil.pulseElementBG( input, "white", ATTEMPT_COLORS[guesses] );
                    gameUtil.showLabel( currentGroup, null, true, true );
                    gameUtil.playSound( ATTEMPT_SOUNDS[Math.min( guesses, 3 )] );
                    next();
                // If input is incorrect
                } else {
                    guesses++;
                    gameUtil.pulseElementBG( input, "white", ATTEMPT_COLORS[3] );
                    gameUtil.playSound( ATTEMPT_SOUNDS[3] );
                    // If too many guesses have been given
                    if ( guesses === maxGuesses ) {
                        gameUtil.showLabel( currentGroup, null, true, true );
                        gameUtil.playSound( ATTEMPT_SOUNDS[4] );
                        next();
                    }
                }
                updateLabels( regionMap, false );
            }
        }
    });
    function next() {
        currentGParent.appendChild( currentGroup );
        currentGroup.classList.remove('typeCurrent');
        currentGroup.classList.add(`guesses${Math.min( guesses, 3 )}`);
        if ( guesses === 0 ) numCorrect++;
        input.value = "";
        if ( !( currentPrompt = promptsArr.pop() ) ) {
            gameUtil.endGame();
        } else {
            currentGroup = gameUtil.queryCurrentRegion( currentPrompt );
            currentGroup.classList.add('typeCurrent');
            promptNumber++;
            guesses = 0;
        }
        switchCurrent()
    }
    function switchCurrent() {
        // Save parent so we can move currentGroup back
        currentGParent = currentGroup.parentElement;
        // Move currentGroup to bottom of SVG so its outline is displayed on top
        svg.appendChild( currentGroup );
    }
    endGameButton.addEventListener('click', e => {
        currentGroup.classList.remove('typeCurrent');
        currentGParent.appendChild( currentGroup );
    });
}
/**
 * Runs the "Type (Invisible)" gamemode
 * @param {ParentChildMap} regionMap
 */
function typeInvisible( regionMap ) {
    invisibleGamemodes();
    svg.classList.add('invisible-mode');
    type( regionMap );
}
/**
 * Runs the "Type (Hard) (Invisible)" gamemode
 * @param {ParentChildMap} regionMap
 */
function typeHardInvisible( regionMap ) {
    invisibleGamemodes();
    maxGuesses = Infinity;
    svg.classList.add('invisible-mode');
    typeHard( regionMap );
}
/**
 * Runs the "Type (Hard) (Invisibler)" gamemode
 * @param {ParentChildMap} regionMap
 */
function typeHardInvisibler( regionMap ) {
    invisibleGamemodes();
    maxGuesses = Infinity;
    svg.classList.add('invisible-mode-hard');
    typeHard( regionMap );
}
/**
 * Function runs for all gamemodes with invisible outlines
 */
function invisibleGamemodes() {
    invisible = true;
    pathOutlines.parentElement.appendChild( pathOutlines );
    pathOutlines.setAttribute( 'display', 'block' ) ;
}

/**
 * Runs the "Outline" gamemode
 * @param {ParentChildMap} regionMap
 */
function outline( regionMap ) {

}
/**
 * Runs the "No Map" gamemode
 * @param {ParentChildMap} regionMap
 */
function noMap( regionMap ) {
    svg.style.display = "none";
    type( regionMap );
    endGameButton.addEventListener('click', e => {
        svg.style.display = "flex";
    });
}
/**
 * Runs the "No List" gamemode
 * @param {ParentChildMap} regionMap
 */
function noList( regionMap ) {
    listGamemodes( regionMap );
    gameUtil.populateSelect( regionMap );
    svg.style.display = "none";
    // Format top gamebar
    promptLabel.textContent = "Name all regions";
    tally.textContent = "Correct: ?";
    promptBar.style.display = "flex";
    showNames.setAttribute('disabled', true);
    input.focus();

    const missedRegions = new Map(), unknownRegions = new Map(), duplicateRegions = new Map();
    const maps = [ unknownRegions, duplicateRegions ];
    // Initialize all names as "missed regions" 
    for ( const parentName of regionMap.getParentNames() ) {
        missedRegions.set( parentName, [] );
        // Initialize all regions into missedRegions
        for ( const childName of regionMap.getChildNames( parentName ) ) {
            missedRegions.get( parentName ).push( childName );
        }
    }

    input.addEventListener('keypress', e => {
        if ( e.key === 'Enter' ) {
            const pValue = selectParent.value;
            // If input is valid
            if ( input.value !== '' && pValue !== '' ) {
                const myInput = util.inputToId( input.value );
                input.value = "";
                gameUtil.playSound( ATTEMPT_SOUNDS[1] );
                // If the user input matches a region's name
                if ( regionMap.hasChild( pValue, myInput ) ) {
                    const group = svg.querySelector(`G#${selectParent.value} G PATH#${CSS.escape( myInput )}`);
                    // The user has not yet typed this region
                    if ( !group.classList.contains('typed') ) {
                        // Remove the region from missedRegions
                        missedRegions.get( pValue ).splice( missedRegions.get( pValue ).indexOf( myInput ), 1 );
                        // Update map
                        group.classList.add('typed');
                        group.classList.add('guesses0');
                        // Update list
                        const correctNode = noMapArea.querySelector(`#${pValue} #${myInput}`);
                        correctNode.textContent = util.idToInput( myInput );
                        correctNode.style["background-color"] = "rgb(75, 255, 75)";
                        correctNode.style["border"] = "1px solid green";
                        numCorrect++;
                    }
                    // The user has already typed this region
                    else {
                        // Initialize array for parent if it doesn't exist
                        if ( !duplicateRegions.get( pValue ) ) duplicateRegions.set( pValue, new Array() );
                        // Only add if it isn't already on there
                        if ( !duplicateRegions.get( pValue ).includes( myInput ) ) duplicateRegions.get( pValue ).push( myInput );
                    }
                }
                // User input doesn't match a region's name
                else {
                    // Initialize array for parent if it doesn't exist
                    if ( !unknownRegions.get( pValue ) ) unknownRegions.set( pValue, new Array() );
                    unknownRegions.get( pValue ).push( myInput );
                }
                gameUtil.pulseElementBG( input, "white", ATTEMPT_COLORS[1] );
            }
        }
    });
    const regionAreas = [ noListArea.querySelector('#unknown-regions'), noListArea.querySelector('#duplicate-regions'), ];
    endGameButton.addEventListener('click', e => {
        const endGameRegionsTemplate = document.getElementById('endGame-regions-template');
        // Display map and list
        // For each map of region correctness
        for ( let i = 0; i < maps.length; i++ ) {
            // For each parent and their regions
            maps[i].forEach( ( regions, parent ) => {
                const containerInstance = endGameRegionsTemplate.content.cloneNode(true);
                const containerElement = containerInstance.querySelector('DIV');
                const parentLabel = containerElement.querySelector('H5');
                parentLabel.textContent = util.idToInput( parent );
                const nameContainer = containerElement.querySelector('DIV');
                for ( const regionName of regions ) {
                    const p = document.createElement('P');
                    p.textContent = util.idToInput( regionName );
                    nameContainer.appendChild( p );
                }
                regionAreas[i].appendChild( containerElement );
            });
        }
        updateLabels( regionMap, true )
        svg.style.display = "flex";
        noMapArea.style.display = "flex";
        noListArea.style.display = "flex";
    });
}

/**
 * Updates labels such as ones with the class 'click-on' to contain the current region
 * and the top game bar's prompt count and correct tally
 * @param {ParentChildMap} regionMap
 */
function updateLabels( regionMap, showPrompt ) {
    if ( numPrompts === 0 ) numPrompts = regionMap.numChildren();
    promptTally.textContent = `Prompt ${promptNumber}/${numPrompts}`;
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    if ( showPrompt ) {
        for ( const label of document.querySelectorAll('.click-on') ) {
            label.textContent = ( ( currentPrompt ? currentPrompt.pID : "-" ) === "-" ) ? "-" : currentPrompt.rInput;
        }
    }
}

export const gamemodeMap = {
    'Learn': learn,
    'Click': click,
    'Click (Disappear)': clickDisappear,
    'Type': type,
    'Type (Hard)': typeHard,
    'Type (Invisible)': typeInvisible,
    'Type (Hard) (Invisible)': typeHardInvisible,
    'Type (Hard) (Invisibler)': typeHardInvisibler,
    'Outline': outline,
    'No Map': noMap,
    'No List': noList,
};