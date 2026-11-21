/** @type {HTMLInputElement} */
export const mapName = document.getElementById('map-name');
/** @type {HTMLSelectElement} */
export const mapTemplate = document.getElementById('select-template');
/** @type {HTMLInputElement} */
export const mapColor = document.getElementById('map-color');
/** @type {HTMLInputElement} */
export const mapThumbnail = document.getElementById('map-thumbnail');
/** @type {HTMLFormElement} */
export const createForm = document.getElementById('create-form');
/** @type {HTMLButtonElement} */
export const createButton = document.getElementById('create-button');

/** @type {HTMLDivElement} */
export const modificationButtonsPanel = document.getElementById('modification-buttons-panel');
/** @type {HTMLDivElement} */
export const mainButtons = document.getElementById('main-buttons');
/** @type {HTMLDivElement} */
export const setRegionTypePanel = document.getElementById('set-region-type-panel');
/** @type {HTMLButtonElement} */
export const resetSelectionBtn = document.getElementById('reset-selection-btn');
/** @type {HTMLButtonElement} */
export const transformRegionsBtn = document.getElementById('transform-regions-btn');

/** @type {HTMLInputElement} */
export const showOutline = document.getElementById('show-outline');
/** @type {HTMLDivElement} */
export const mapContainer = document.getElementById('map-container');

/** @type {SVGElement} */
export const svg = document.getElementById('templateMap');
/** @type {SVGRectElement} */
export const mapOutline = document.getElementById('map-outline');
/** @type {SVGGElement} */
export const transformRegionsOutline = document.getElementById('transform-regions-outline');
/** @type {SVGRectElement} */
export const topLeft = transformRegionsOutline.querySelector("#resize-top-left");
/** @type {SVGRectElement} */
export const topRight = transformRegionsOutline.querySelector("#resize-top-left");
/** @type {SVGRectElement} */
export const bottomLeft = transformRegionsOutline.querySelector("#resize-top-left");
/** @type {SVGRectElement} */
export const bottomRight = transformRegionsOutline.querySelector("#resize-top-left");
/** @type {SVGRectElement} */
export const resizeBorder = transformRegionsOutline.querySelector("#resize-top-left");

/** @type {HTMLDivElement} */
export const selectedList = document.getElementById('selected-list');

/** @type {HTMLDivElement} */
export const loadingScreen = document.getElementById('loading-screen');