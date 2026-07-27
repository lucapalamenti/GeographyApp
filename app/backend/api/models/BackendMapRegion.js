const MapRegion = require("./MapRegion.js");
const Region = require("./Region.js");
 
module.exports = class BackendMapRegion {
    /** @type {Region} */
    region = null;
    /** @type {MapRegion} */
    mapRegion = null;
   
    /**
     * Constructor given fields for Region and MapRegion objects
     * @param {Region & MapRegion} data
     */
    constructor ( data ) {
        // constructors will() will only use necessary fields
        this.region = new Region( data );
        this.mapRegion = new MapRegion( data );
    }
}