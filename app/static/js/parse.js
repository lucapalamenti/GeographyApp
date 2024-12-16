const fs = require('fs');


const e = document.getElementById('RhodeIsland');

e.addEventListener('click', () => {
    fs.readFile('test.txt', (err, data) => {
        if ( err ) throw err;
    
        console.log( data.toString() );
    });
});
