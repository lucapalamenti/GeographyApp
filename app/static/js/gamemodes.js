import util from "./util.js";
import gameUtil from "./gameUtil.js";

const svg = document.querySelector('SVG');
const promptBar = document.getElementById('prompt-bar');
const input = promptBar.querySelector('INPUT');
const promptLabel = promptBar.querySelector('P');
const tally = promptBar.querySelector('#tally');

const zoomSlider = document.getElementById('zoom-slider');
const tooltip = document.getElementById('tooltip');
const selectParent = document.getElementById('select-parent');
const showNames = document.getElementById('showNames');
const noMapArea = document.getElementById('no-map-area');
const noListArea = document.getElementById('no-list-area');
const endGameButton = document.getElementById('noList-end-button');
const reviewMapButton = document.getElementById('review-button');

let promptsArr;
let current = {
    pID : "",
    pInput : "",
    rID : "",
    rInput : ""
};
/**
 * Returns a reference to the G element for the current region
 * @returns {HTMLElement}
 */
const queryCurrentRegion = () => { return svg.querySelector(`svg > #${current.pID} #${current.rID}`) };

let numPrompts;
let numCorrect = 0;
let guesses = 0;

const ATTEMPT_COLORS = [ 'rgb(75, 255, 75)', 'rgb(240, 219, 35)', 'rgb(243, 148, 24)', 'rgb(235, 89, 89)' ];
const REPEAT_COLOR = "rgba(172, 233, 164, 1)";
const MAX_GUESSES = 3;

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
        if ( svg.querySelector(`svg > g g #${group.id}`) ) {
            gameUtil.showLabel( group, e, true, true );
            gameUtil.regionDisappearTrigger( group, ATTEMPT_COLORS[0], true, 1000, 1000 );
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
    tally.textContent = `Correct: ${numCorrect}/${numPrompts = gameUtil.getNumPrompts( regionMap )}`;
    // Shuffle the prompts and display the first one on screen
    promptsArr = gameUtil.shuffleRegionMap( regionMap );
    current = promptsArr.pop();
    updateLabels();
    promptBar.style.display = "flex";
    // Setup tooltip to follow cursor
    svg.addEventListener('mousemove', moveToolTip );
    svg.addEventListener('scroll', moveToolTip );
    svg.addEventListener('mouseout', e => {
        tooltip.style.display = "none" ;
    });
    function moveToolTip( e ) {
        tooltip.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( 60% + ${e.clientY + window.scrollY}px ) )`;
        tooltip.style.display = "block";
    }
    // In disappear mode remove showGuesses so that the region color changes back to default
    if ( disappear ) svg.classList.remove("showGuesses");
    svg.addEventListener('click', e => {
        const group = e.target.parentNode;
        if ( group.classList.contains('clickable') ) {
            // Correct region clicked
            if ( group.getAttribute('id') === current.rID ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                gameUtil.regionDisappearTrigger( group, ATTEMPT_COLORS[3], true );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === MAX_GUESSES ) {
                    const correctRegion = queryCurrentRegion();
                    gameUtil.showLabel( correctRegion, e, true, true );
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
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
        // If there are no more prompts left
        if ( !( current = promptsArr.pop() ) )
            gameUtil.endGame();
        // Continue to next prompt
        else {
            updateLabels();
            guesses = 0;
        }
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
    svg.querySelectorAll('g.enabled g, g.herring g').forEach( group => {
        group.classList.add("clickable");
    });
}

/**
 * Runs with all typing gamemodes
 * @param {Map<String,Array<String>} regionMap 
 */
function typeGamemodes( regionMap ) {
    tally.textContent = `Correct: ${numCorrect}/${numPrompts = gameUtil.getNumPrompts( regionMap )}`;
    promptBar.style.display = "flex";
    input.focus();
}
/**
 * Runs with all gamemodes that show the list
 * @param {Map<String,Array<String>} regionMap 
 */
function listGamemodes( regionMap ) {
    const alphabetized = [];
    regionMap.forEach(( regionNames, parentName ) => {
        alphabetized.push( parentName );
    });
    alphabetized.sort();
    for ( const parentName of alphabetized ) {
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
                    const group = svg.querySelector(`#${CSS.escape( myInput )}`);
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
                    }
                    // The user has already typed this region
                    else {
                        gameUtil.regionDisappearTrigger( group, REPEAT_COLOR, false, 0 );
                        gameUtil.pulseElementBG( noMapArea.querySelector(`#${selectParent.value} #${myInput}`), "rgb(75, 255, 75)", color );
                    }
                }
                gameUtil.pulseElementBG( input, "white", color );
                tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
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
    typeGamemodes( regionMap );
    promptsArr = gameUtil.shuffleRegionMap( regionMap );
    current = promptsArr.pop();

    let currentGroup = queryCurrentRegion();
    currentGroup.classList.add('typeCurrent');

    input.addEventListener('keypress', e => {
        // If enter key is pressed
        if ( e.key === 'Enter' ) {
            // Only check if the value & parent arent blank
            if ( input.value !== '' ) {
                // If input is correct
                if ( input.value.toLowerCase() === current.rInput.toLowerCase() ) {
                    gameUtil.pulseElementBG( input, "white", ATTEMPT_COLORS[guesses] );
                    gameUtil.showLabel( currentGroup, null, true, true );
                    next();
                // If input is incorrect
                } else {
                    gameUtil.pulseElementBG( input, "white", ATTEMPT_COLORS[3] );
                    guesses++;
                    // If too many guesses have been given
                    if ( guesses === MAX_GUESSES ) {
                        gameUtil.showLabel( currentGroup, null, true, true );
                        next();
                    }
                }
                tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
            }
        }
    });
    function next() {
        currentGroup.classList.remove('typeCurrent');
        currentGroup.classList.add(`guesses${guesses}`);
        if ( guesses === 0 ) numCorrect++;
        input.value = "";
        if ( !( current = promptsArr.pop() ) ) {
            gameUtil.endGame();
        } else {
            currentGroup = queryCurrentRegion();
            currentGroup.classList.add('typeCurrent');
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

    const correctRegions = new Map(), missedRegions = new Map(), unknownRegions = new Map(), duplicateRegions = new Map();
    const maps = [ correctRegions, missedRegions, unknownRegions, duplicateRegions ];
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

                // Initially set to 'incorrect' color
                let color = ATTEMPT_COLORS[3];
                // If the user input matches a region's name
                if ( regionMap.get( pValue ).includes( myInput ) ) {
                    color = REPEAT_COLOR;
                    const group = svg.querySelector(`#${CSS.escape( myInput )}`);
                    // The user has not yet typed this region
                    if ( !group.classList.contains('typed') ) {
                        // Initialize array for parent if it doesn't exist
                        if ( !correctRegions.get( pValue ) ) correctRegions.set( pValue, new Array() );
                        correctRegions.get( pValue ).push( myInput );
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
    const regionAreas = [
        document.getElementById('correct-regions'),
        document.getElementById('missed-regions'),
        document.getElementById('unknown-regions'),
        document.getElementById('duplicate-regions'),
    ];
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
        svg.parentNode.style.display = "flex";
        noMapArea.style.display = "flex";
        noListArea.style.display = "flex";
    });
}

/**
 * Updates all labels with the class 'click-on' to contain the current region
 * to click on
 */
function updateLabels() {
    for ( const label of document.querySelectorAll('.click-on') ) {
        label.textContent = ( current.pID === "-" ) ? "-" : current.rInput;
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