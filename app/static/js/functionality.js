import APIClient from './APIClient.js';

const svg = document.querySelector('SVG');

document.addEventListener('DOMContentLoaded', () => {
    loadAll();
});

const loadAll = () => {
    APIClient.getShapes().then( returnedShapes => {
        returnedShapes.forEach( shape => {
            const polygon = document.getElementById('polygon-template').content.cloneNode(true).querySelector('POLYGON');
            polygon.setAttribute('class', shape.shape_name.split(' ').join('_'));
            polygon.setAttribute('points', shape.shape_points);
            svg.appendChild( polygon );
            polygon.addEventListener('mouseover', () => {
                document.querySelectorAll(`.${polygon.className.baseVal}`).forEach( eWithSameClass => {
                    eWithSameClass.style.fill = "rgb(210, 211, 117)";
                });
            });
            polygon.addEventListener('mousedown', () => {
                document.querySelectorAll(`.${polygon.className.baseVal}`).forEach( eWithSameClass => {
                    eWithSameClass.style.fill = "rgb(190, 191, 97)";
                });
            });
            polygon.addEventListener('mouseup', () => {
                document.querySelectorAll(`.${polygon.className.baseVal}`).forEach( eWithSameClass => {
                    eWithSameClass.style.fill = "rgb(210, 211, 117)";
                });
            });
            polygon.addEventListener('mouseout', () => {
                document.querySelectorAll(`.${polygon.className.baseVal}`).forEach( eWithSameClass => {
                    eWithSameClass.style.fill = "";
                });
            });
        });
    }).catch( err => {
        console.error( err );
    });
}