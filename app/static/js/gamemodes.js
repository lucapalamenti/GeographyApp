export const gamemodeMap = {
    'click': click,
    'clickDisappear': clickDisappear,
    'clickEndless': clickEndless,
    'type': type,
    'typeHard': typeHard,
    'typeEndless': typeEndless,
    'noMap': noMap,
    'noList': noList
};

const svg = document.querySelector('SVG');
const promptBar1 = document.getElementById('prompt-bar-1');
const promptBar2 = document.getElementById('prompt-bar-2');
let tally;
let numCorrect = 0;
let guesses = 1;

function click ( shapeNames ) { clickGamemodes( shapeNames, false, false ); }
function clickDisappear ( shapeNames ) { clickGamemodes( shapeNames, true, false ); }
function clickEndless ( shapeNames ) { clickGamemodes( shapeNames, true, true ); }

function clickGamemodes( shapeNames, disappear, endless ) {
    const totalShapes = endless ? Infinity : shapeNames.length;
    const strong = promptBar1.querySelector('STRONG');
    let arr = shapeNames;
    // Shuffle the array
    for ( let i = shapeNames.length - 1; i >= 0; i-- ) {
        const j = Math.floor( Math.random() * i );
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    let current = arr.pop();
    strong.textContent = current;
    let endlessQueue = [current];
    promptBar1.style.display = "flex";
    tally = document.getElementById('tally');
    tally.textContent = `${numCorrect}/${totalShapes}`;

    svg.addEventListener('click', e => {
        const target = e.target;
        if ( target.nodeName === "polygon" && target.classList.length === 1 ) {
            // Correct region clicked
            if ( target.className.baseVal === current.split(' ').join('_') ) {
                if ( guesses === 1 ) {
                    numCorrect++;
                } else {
                    guesses = 1;
                }
                document.querySelectorAll(`.${target.className.baseVal}`).forEach( polygon => {
                    polygon.style.fill = 'rgb(0, 255, 0)';
                    // Disappear gamemode
                    if ( disappear ) {
                        polygon.classList.add('polygonClicked');
                        setTimeout( function() {
                            polygon.style.transition = 'fill 1s ease';
                            polygon.style.fill = '';
                            setTimeout( function() {
                                polygon.style.transition = '';
                                polygon.classList.remove('polygonClicked');
                            }, 1000 );
                        }, 1000 );
                    }
                    // Standard gamemode
                    else {
                        polygon.classList.add('polygonCorrect');
                    }
                    
                });
                tally.textContent = `${numCorrect}/${totalShapes}`;
                if ( !( current = arr.pop() ) ) {
                    win();
                    strong.textContent = '-';
                } else {
                    strong.textContent = current;
                    // Endless gamemode
                    if ( endless ) {
                        endlessQueue.push( current );
                        if ( endlessQueue.length > arr.length) {
                            // Pick a random index in the front half of the waiting queue
                            const index1 = Math.floor( Math.random() * endlessQueue.length / 2 );
                            // Pick a random index in the back half of the current queue
                            const index2 = Math.floor( Math.random() * arr.length / 2 );
                            // Insert the value from waiting queue into the current queue
                            arr = arr.slice( 0, index2 ).concat( endlessQueue.at( index1 ), arr.slice( index2 ) );
                            endlessQueue = endlessQueue.slice(0, index1).concat( endlessQueue.slice( index1 + 1 ) );
                        }
                    }
                }
            }
            // Incorrect region clicked
            else {
                guesses++;
                document.querySelectorAll(`.${target.className.baseVal}`).forEach( polygon => {
                    polygon.classList.add('polygonClicked');
                    polygon.style.fill = 'red';
                    setTimeout( function() {
                        polygon.style.transition = 'fill 1s ease';
                        polygon.style.fill = '';
                        setTimeout( function() {
                            polygon.style.transition = '';
                            polygon.classList.remove('polygonClicked');
                        }, 1000 );
                    }, 1000 );
                });
            }
        }
    });
}

function type( shapeNames ) { typeGamemodes( shapeNames, false, false ); }
function typeHard( shapeNames ) { typeGamemodes( shapeNames, true, false ); }
function typeEndless( shapeNames ) { typeGamemodes( shapeNames, false, true ); }

function typeGamemodes( shapeNames, hard, endless ) {
    promptBar2.style.display = "flex";
}

function noMap( shapeNames ) {

}

function noList( shapeNames ) {

}

function win() {
    console.log( "YOU WIN!" );
}