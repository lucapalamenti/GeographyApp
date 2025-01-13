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

function click( shapeNames ) {
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
    promptBar1.style.display = "flex";

    svg.addEventListener('click', e => {
        const target = e.target;
        if ( target.nodeName === "polygon" && target.classList.length === 1 ) {
            // Correct region clicked
            if ( target.className.baseVal === current.split(' ').join('_') ) {
                document.querySelectorAll(`.${target.className.baseVal}`).forEach( polygon => {
                    polygon.classList.add('polygonCorrect');
                    polygon.style.fill = 'green';
                });
                if ( !(current = arr.pop()) ) {
                    console.log( "YOU WIN!" );
                    strong.textContent = '-';
                } else {
                    strong.textContent = current;
                }
            }
            // Incorrect region clicked
            else {
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

function clickDisappear( shapeNames ) {
    clickGamemodes( shapeNames );
}

function clickEndless( shapeNames ) {
    clickGamemodes( shapeNames );
}

function type( shapeNames ) {
    typeGamemodes( shapeNames );
}

function typeHard( shapeNames ) {
    typeGamemodes( shapeNames );
}

function typeEndless( shapeNames ) {
    typeGamemodes( shapeNames );
}

function noMap( shapeNames ) {

}

function noList( shapeNames ) {

}

/**
 * @param {Array} shapeNames 
 */
function clickGamemodes( shapeNames ) {
    
}

function typeGamemodes( shapeNames ) {
    promptBar2.style.display = "flex";
}