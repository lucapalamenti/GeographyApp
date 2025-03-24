import APIClient from './APIClient.js';
import populateSVG from './populateSVG.js';

const selectTemplate = document.getElementById('select-template');
const svg = document.getElementById('templateMap');

await APIClient.getMaps( 'map_name' ).then( maps => {
    maps.forEach( map => {
        const option = document.createElement('OPTION');
        option.textContent = map.map_name;
        option.value = map.map_id;
        selectTemplate.appendChild( option );
    });
}).catch( err => {
    console.error( err );
});

selectTemplate.addEventListener('change', async e => {
    await APIClient.getMapById( selectTemplate.value ).then( async map => {
        await populateSVG( map, svg ).then( shapeNames => {
            
        });
    });
    
});