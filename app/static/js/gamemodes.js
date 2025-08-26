import util from "./util.js";
import gameUtil from "./gameUtil.js";

import { svg, promptBar, input, promptLabel, noListArea, endGameButton, reviewMapButton, tally, promptTally, zoomSlider, selectParent, showNames, noMapArea } from "./documentElements-game.js";
import { ATTEMPT_COLORS, REPEAT_COLOR, MAX_GUESSES, ATTEMPT_SOUNDS } from "./variables.js";

let promptsArr;
let currentPrompt = { pID : "", pInput : "", rID : "", rInput : "" };

let numPrompts = 0;
let promptNumber = 1;
let numCorrect = 0;
let guesses = 0;

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
        const group = e.target.parentNode;
        if ( group.parentElement !== svg && svg.querySelector(`svg > g g #${group.id}`) ) {
            gameUtil.showLabel( group, e, true, true );
            gameUtil.regionDisappearTrigger( group, ATTEMPT_COLORS[0], true, 1000, 1000 );
            gameUtil.playSound( ATTEMPT_SOUNDS[1] );
        }
    });
}

/**
 * Run the "Click" gamemode
 * @param {Map<String,Array<String>} regionMap 
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
        const group = e.target.parentNode;
        if ( group.classList.contains('clickable') ) {
            // Correct region clicked
            if ( group.getAttribute('id') === currentPrompt.rID ) {
                if ( guesses === 0 ) numCorrect++;
                gameUtil.playSound( ATTEMPT_SOUNDS[guesses] );
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                gameUtil.regionDisappearTrigger( group, ATTEMPT_COLORS[3], true );
                gameUtil.playSound( ATTEMPT_SOUNDS[3] );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === MAX_GUESSES ) {
                    const correctRegion = gameUtil.queryCurrentRegion( currentPrompt );
                    gameUtil.showLabel( correctRegion, e, true, true );
                    gameUtil.playSound( ATTEMPT_SOUNDS[4] );
                    next( correctRegion );
                }
            }
            gameUtil.showLabel( group, e, false, true );
        }
    });
    function next( group ) {
        // In disappear mode regions fade back to original color
        if ( disappear ) gameUtil.regionDisappearTrigger( group, ATTEMPT_COLORS[guesses], true );
        else group.classList.remove('clickable');
        
        group.classList.add(`guesses${guesses}`);
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
 * @param {Map<String,Array<String>} regionMap 
 */
function clickDisappear ( regionMap ) {
    click( regionMap, true );
}
/**
 * Makes sure all regions that should be clickable have the class "clickable"
 */
function enableClicking() {
    selectParent.setAttribute('hidden', true);
    svg.querySelectorAll('g.enabled g, g.herring g').forEach( group => {
        group.classList.add("clickable");
    });
}

/**
 * Runs with all typing gamemodes
 * @param {Map<String,Array<String>} regionMap 
 */
function typeGamemodes( regionMap ) {
    updateLabels( regionMap, false );
    promptBar.style.display = "flex";
    input.focus();
}
/**
 * Runs with all gamemodes that show the list
 * @param {Map<String,Array<String>} regionMap 
 */
function listGamemodes( regionMap ) {
    for ( const parentName of gameUtil.getOrderedParents( regionMap ) ) {
        const h3 = document.createElement('H3');
        h3.textContent = util.idToInput( parentName );
        const div = document.createElement('DIV');
        div.setAttribute('id', parentName);
        for ( const name of regionMap.get( parentName ) ) {
            const p = document.createElement('P');
            p.setAttribute('id', name);
            div.appendChild( p );
        }
        noMapArea.appendChild( h3 );
        noMapArea.appendChild( div );
    }
}
/**
 * Runs the "Type" gamemode
 * @param {Map<String,Array<String>} regionMap
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
                if ( regionMap.get( selectParent.value ).includes( myInput ) ) {
                    color = REPEAT_COLOR;
                    const group = svg.querySelector(`G#${selectParent.value} G G#${CSS.escape( myInput )}`);
                    // The user has not yet typed this region
                    if ( !group.classList.contains('typed') ) {
                        // Update map
                        group.classList.add('typed');
                        group.classList.add('guesses0');
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
                        gameUtil.regionDisappearTrigger( group, REPEAT_COLOR, false, 0 );
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
 * @param {Map<String,Array<String>} regionMap
 */
function typeHard( regionMap ) {
    promptLabel.textContent = "Name the highlighted region";
    selectParent.setAttribute('hidden', true);
    typeGamemodes( regionMap );
    promptsArr = gameUtil.shuffleRegionMap( regionMap );
    currentPrompt = promptsArr.pop();

    let currentGroup = gameUtil.queryCurrentRegion( currentPrompt );
    currentGroup.classList.add('typeCurrent');

    input.addEventListener('keypress', e => {
        // If enter key is pressed
        if ( e.key === 'Enter' ) {
            // Only check if the value & parent arent blank
            if ( input.value !== '' ) {
                // If input is correct
                if ( input.value.toLowerCase() === currentPrompt.rInput.toLowerCase() ) {
                    gameUtil.pulseElementBG( input, "white", ATTEMPT_COLORS[guesses] );
                    gameUtil.showLabel( currentGroup, null, true, true );
                    gameUtil.playSound( ATTEMPT_SOUNDS[guesses] );
                    next();
                // If input is incorrect
                } else {
                    guesses++;
                    gameUtil.pulseElementBG( input, "white", ATTEMPT_COLORS[3] );
                    gameUtil.playSound( ATTEMPT_SOUNDS[3] );
                    // If too many guesses have been given
                    if ( guesses === MAX_GUESSES ) {
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
        currentGroup.classList.remove('typeCurrent');
        currentGroup.classList.add(`guesses${guesses}`);
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
    }
    endGameButton.addEventListener('click', e => {
        currentGroup.classList.remove('typeCurrent');
    });
}
/**
 * Runs the "Outline" gamemode
 * @param {Map<String,Array<String>} regionMap
 */
function outline( regionMap ) {

}
/**
 * Runs the "No Map" gamemode
 * @param {Map<String,Array<String>} regionMap
 */
function noMap( regionMap ) {
    svg.parentNode.style.display = "none";
    type( regionMap );
    endGameButton.addEventListener('click', e => {
        svg.parentNode.style.display = "flex";
    });
}
/**
 * Runs the "No List" gamemode
 * @param {Map<String,Array<String>} regionMap
 */
function noList( regionMap ) {
    listGamemodes( regionMap );
    gameUtil.populateSelect( regionMap );
    svg.parentNode.style.display = "none";
    // Format top gamebar
    promptLabel.textContent = "Name all regions";
    tally.textContent = "Correct: ?";
    promptBar.style.display = "flex";
    showNames.setAttribute('disabled', true);
    zoomSlider.setAttribute('disabled', true);
    input.focus();

    const missedRegions = new Map(), unknownRegions = new Map(), duplicateRegions = new Map();
    const maps = [ unknownRegions, duplicateRegions ];
    regionMap.forEach(( regionNames, parent ) => {
        missedRegions.set( parent, new Array() );
        // Initialize all regions into missedRegions
        for ( const name of regionNames ) {
            missedRegions.get( parent ).push( name );
        }
    });
    input.addEventListener('keypress', e => {
        if ( e.key === 'Enter' ) {
            const pValue = selectParent.value;
            // If input is valid
            if ( input.value !== '' && pValue !== '' ) {
                const myInput = util.inputToId( input.value );
                input.value = "";
                gameUtil.playSound( ATTEMPT_SOUNDS[1] );
                // If the user input matches a region's name
                if ( regionMap.get( pValue ).includes( myInput ) ) {
                    const group = svg.querySelector(`G#${selectParent.value} G G#${CSS.escape( myInput )}`);
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
        svg.parentNode.style.display = "flex";
        noMapArea.style.display = "flex";
        noListArea.style.display = "flex";
    });
}

/**
 * Updates labels such as ones with the class 'click-on' to contain the current region
 * and the top game bar's prompt count and correct tally
 * @param {Map<String,Array<String>} regionMap
 */
function updateLabels( regionMap, showPrompt ) {
    if ( numPrompts === 0 ) numPrompts = gameUtil.getNumPrompts( regionMap );
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
    'Outline': outline,
    'No Map': noMap,
    'No List': noList,
};