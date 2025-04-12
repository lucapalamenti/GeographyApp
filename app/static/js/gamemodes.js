import util from "./util.js";

const svg = document.querySelector('SVG');
const promptBar = document.getElementById('prompt-bar');
const input = promptBar.querySelector('INPUT');
const promptLabel = promptBar.querySelector('P');
const tally = promptBar.querySelector('#tally');

const zoomSlider = document.getElementById('zoom-slider');
const tooltip = document.getElementById('tooltip');
const gameEndPanel = document.getElementById('game-end-panel');
const covering = document.getElementById('covering');
const selectParent = document.getElementById('select-parent');
const showNames = document.getElementById('showNames');

let arr;
let current;

let numPrompts;
let numCorrect = 0;
let guesses = 0;
const clickColors = [ 'rgb(106, 235, 89)', 'rgb(240, 219, 35)', 'rgb(243, 148, 24)', 'rgb(235, 89, 89)' ];

const SVG_WIDTH = 1600;
const SVG_HEIGHT = 900;
const MAX_GUESSES = 3;

function learn() {
    promptLabel.textContent = "Click on a region to see its name";
    input.style.display = 'none';
    promptBar.style.display = "flex";
    document.querySelectorAll('G').forEach( group => {
        group.classList.add('groupClickable');
    });
    svg.addEventListener('click', e => {
        const group = e.target.parentNode;
        if ( group.nodeName === "g" ) showLabel( group, e, true, true );
    });
}

function clickGamemodes( regionNames ) {
    numPrompts = regionNames.length;
    document.querySelectorAll('G').forEach( group => {
        group.classList.add('groupClickable');
    });

    promptLabel.textContent = "Click on";
    input.style.display = 'none';
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;

    arr = shuffleArray( regionNames );
    current = arr.pop();
    updateLabels();
    
    promptBar.style.display = "flex";

    svg.addEventListener('mousemove', moveToolTip );
    svg.addEventListener('scroll', moveToolTip );
    svg.addEventListener('mouseout', e => {
        tooltip.style.display = "none" ;
    });
    function moveToolTip( e ) {
        tooltip.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( 60% + ${e.clientY + window.scrollY}px ) )`;
        tooltip.style.display = "block";
    }
}
function click ( regionNames ) {
    clickGamemodes( regionNames, false );
    svg.addEventListener('click', e => {
        const group = e.target.parentNode;
        if ( group.classList.contains('groupClickable') ) {
            // Correct region clicked
            if ( util.idToInput( group.getAttribute('id') ) === util.idToInput( current ) ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                regionDisappearTrigger( group, clickColors[3], true );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === MAX_GUESSES ) {
                    showLabel( svg.getElementById( current ), e, true, true );
                    next( svg.getElementById( current ) );
                }
            }
            showLabel( group, e, false, true );
        }
    });
    function next( group ) {
        group.classList.remove('groupClickable');
        group.classList.add(`guesses${guesses}`);
        if ( !( current = arr.pop() ) ) {
            endGame();
        } else {
            updateLabels();
            guesses = 0;
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    }
}
function clickDisappear ( regionNames ) {
    clickGamemodes( regionNames );
    svg.classList.remove("showGuesses");
    svg.addEventListener('click', e => {
        const group = e.target.parentNode;
        if ( group.classList.contains('groupClickable') ) {
            // Correct region clicked
            if ( util.idToInput( group.getAttribute('id') ) === util.idToInput( current ) ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                regionDisappearTrigger( group, clickColors[3], true );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === MAX_GUESSES ) {
                    showLabel( svg.getElementById( current ), e, true, true );
                    next( svg.getElementById( current ) );
                }
            }
            showLabel( group, e, false, true );
        }
    });
    function next( group ) {
        regionDisappearTrigger( group, clickColors[guesses], true );
        group.classList.add(`guesses${guesses}`);
        if ( !( current = arr.pop() ) ) {
            // Reappear colors at the end
            svg.classList.add("showGuesses");
            endGame();
        } else {
            updateLabels();
            guesses = 0;
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    }
}

function showLabel( group, e, center, timeout ) {
    const p = document.createElement('P');
    p.classList.add('clickLabel');
    p.textContent = util.idToInput( group.id );
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
}

function typeGamemodes( regionNames ) {
    numPrompts = regionNames.length;
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    promptBar.style.display = "flex";
    input.focus();
}
function type( regionNames, parents ) {
    populateSelect( parents );
    typeGamemodes( regionNames, false );
    promptLabel.textContent = "Name all regions";
    input.addEventListener('keypress', e => {
        // Only continute if Enter is pressed
        if ( e.key !== 'Enter' ) return;
        // Only check the value if it isn't blank
        if ( input.value !== '' ) {
            regionNames.forEach( name => {
                // If there is only one "parent" then dont get selectParent.value
                if ( selectParent.childElementCount === 1 && name === `${parents[0]}__${util.inputToId( input.value )}`
                || name === `${selectParent.value}__${util.inputToId( input.value )}`) {
                    const group = svg.querySelector(`#${CSS.escape( name )}`);
                    if ( group && !group.classList.contains('typed') ) {
                        group.classList.add('typed');
                        input.value = "";
                        numCorrect++;
                    }
                }
            });
            tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
            if ( numCorrect === numPrompts ) endGame();
        }
    });
}
function typeHard( regionNames ) {
    promptLabel.textContent = "Name the highlighted region";
    typeGamemodes( regionNames );
    arr = shuffleArray( regionNames );
    current = arr.pop();

    let currentGroup = svg.querySelector(`#${current}`);
    currentGroup.classList.add('typeCurrent');

    input.addEventListener('keypress', e => {
        if ( e.key !== 'Enter' ) return;
        // Only check the value if it isn't blank
        if ( input.value !== '' ) {
            // If input is correct
            if ( input.value.toLowerCase() === util.idToInput( current ).toLowerCase() ) next(); 
            // If input is incorrect
            else {
                guesses++;
                // If too many guesses have been given
                if ( guesses === MAX_GUESSES ) {
                    showLabel( svg.getElementById( current ), null, true, true );
                    next();
                }
            }
            tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
        }
    });
    function next() {
        currentGroup.classList.remove('typeCurrent');
        currentGroup.classList.add(`guesses${guesses}`);
        if ( guesses === 0 ) numCorrect++;
        input.value = "";
        if ( !( current = arr.pop() ) ) {
            endGame();
        } else {
            currentGroup = svg.querySelector(`#${current}`);
            currentGroup.classList.add('typeCurrent');
            guesses = 0;
        }
    }
}

function outline( regionNames ) {

}

function noMap( regionNames, parents ) {
    populateSelect( parents );
    const noMapArea = document.getElementById('no-map-area');
    numPrompts = regionNames.length;

    let n = 1;
    const array = {};
    regionNames.forEach( name => {
        array[ util.inputToId( name ) ] = n++;
    });

    for ( let i = 0; i < numPrompts; i++ ) {
        noMapArea.appendChild( document.createElement('P') );
    }

    promptLabel.textContent = "Name all regions";
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    noMapArea.style.display = "flex";
    
    document.getElementById('game-area').removeChild( document.getElementById('svg-container') );
    promptBar.style.display = "flex";

    input.addEventListener('keypress', e => {
        if ( e.key === 'Enter' ) {
            // Only check the value if it isn't blank
            if ( input.value !== '' ) {
                const myInput = `__${util.inputToId( input.value )}`;
                if ( array[ myInput ] ) {
                    const correctNode = noMapArea.childNodes[ array[ myInput ] ];
                    correctNode.textContent = util.idToInput( myInput );
                    correctNode.style["background-color"] = "rgb(75, 255, 75)";
                    correctNode.style["border"] = "1px solid green";
                    array[ myInput ] = null;
                    input.value = "";
                    numCorrect++;
                }
            }
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
        if ( numCorrect === numPrompts ) endGame();
    });
}

function noList( regionNames ) {

}

function regionDisappearTrigger( group, color, clickable ) {
    group.classList.remove('groupClickable');
    group.querySelectorAll('POLYGON').forEach( polygon => {
        polygon.style.fill = color;
        // Hold for 1 second
        setTimeout( function() {
            polygon.style.transition = 'fill 1s ease';
            polygon.style.fill = '';
            // Fade out for 1 second
            setTimeout( function() {
                polygon.style.transition = '';
                if ( clickable ) group.classList.add('groupClickable');
            }, 1000 );
        }, 1000 );
    });
}

/**
 * Updates all labels with the class 'click-on' to contain the current region
 * to click on
 */
function updateLabels() {
    document.querySelectorAll('.click-on').forEach( label => {
        label.textContent = ( current === "-" ) ? "-" : util.capitalizeFirst( util.idToInput( current ) );
    });
}

/**
 * Randomly shuffles an array
 * @param {Array} arr 
 */
function shuffleArray( arr ) {
    for ( let i = arr.length - 1; i >= 0; i-- ) {
        const j = Math.floor( Math.random() * i );
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

/**
 * Populates the Select dropdown for gamemodes that need it
 * @param {Array<String>} parents 
 */
function populateSelect( parents ) {
    if ( parents.length === 1 ) return;
    parents.forEach( name => {
        const option = document.createElement('OPTION');
        option.value = name;
        option.innerText = name.split('_').join(' ');
        selectParent.appendChild( option );
    });
    selectParent.style.display = "block";
}

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
}
function unzoom( e ) {
    if ( e.key !== 'Escape' ) return;
    svg.classList.remove(`zoom-${zoomSlider.value}`);
    svg.setAttribute('viewBox', "0 0 1600 900");
    svg.addEventListener( 'contextmenu', zoom );
    document.querySelectorAll('.clickLabel').forEach( label => {
        label.style.display = "none";
    });
    zoomSlider.removeAttribute( 'disabled' );
    showNames.removeAttribute( 'disabled' );
    document.removeEventListener( 'keydown', unzoom );
}

function endGame() {
    current = "-";
    updateLabels();
    input.setAttribute('disabled', true);
    covering.style.visibility = "";
    gameEndPanel.style.display = "flex";
    console.log( "YOU WIN!" );
}

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

export const gamemodeMap = {
    'learn': learn,
    'click': click,
    'clickDisappear': clickDisappear,
    'type': type,
    'typeHard': typeHard,
    'outline': outline,
    'noMap': noMap,
    'noList': noList,
};