import fs from "fs";

import RegionDAO from "./RegionDAO.js";
import database from "./databaseConnections.js";
// import US_Counties_Parse from './backend/test/US_Counties-parse.js';
// import US_States_Parse from './backend/test/US_States-Parse.js';
// import US_States_Polygon_Parse from './backend/test/US_States_Polygon-parse.js';
const US_States_Polygon_Parse = 1;
const mapIdCode = {
    "Alabama": "53",
    "Alaska": "54",
    "Arizona": "55",
    "Arkansas": "56",
    "California": "57",
    "Colorado": "58",
    "Connecticut": "59",
    "Delaware": "60",
    "Florida": "61",
    "Georgia": "62",
    "Hawaii": "63",
    "Idaho": "64",
    "Illinois": "65",
    "Indiana": "66",
    "Iowa": "67",
    "Kansas": "68",
    "Kentucky": "69",
    "Louisiana": "70",
    "Maine": "71",
    "Maryland": "72",
    "Massachusetts": "73",
    "Michigan": "74",
    "Minnesota": "75",
    "Mississippi": "76",
    "Missouri": "77",
    "Montana": "78",
    "Nebraska": "79",
    "Nevada": "80",
    "New Hampshire": "81",
    "New Jersey": "82",
    "New Mexico": "83",
    "New York": "84",
    "North Carolina": "85",
    "North Dakota": "86",
    "Ohio": "87",
    "Oklahoma": "88",
    "Oregon": "89",
    "Pennsylvania": "90",
    "Rhode Island": "91",
    "South Carolina": "92",
    "South Dakota": "93",
    "Tennessee": "94",
    "Texas": "95",
    "Utah": "96",
    "Vermont": "97",
    "Virginia": "98",
    "Washington": "99",
     "West Virginia": "100",
     "Wisconsin": "101",
     "Wyoming": "102",
     "United States": null
};

const custom = async () => {
    await database.query(`
        UPDATE mapRegion
        SET mapRegion_map_id = 4
        WHERE mapRegion_map_id = 57;
        `, []).then( rows => {
            return rows;
        });
};

const custom3 = async () => {
    const filename = "03-Regions-US_Counties";
    let seenRegions = new Set();
    for ( let i = 2426; i <= 5878; i++ ) {
        const p = await PolygonDAO.getPolygonById( i );
        if ( !seenRegions.has( p.polygon_region_id ) ) {
            const r = await RegionDAO.getRegionById( p.polygon_region_id );
            const parent = await RegionDAO.getMapRegionParent( p.polygon_region_id );
            seenRegions.add( r.region_id );
            let rContent = `INSERT INTO \`region\` (\`region_id\`, \`region_name\`, \`region_parent_id\`) VALUES (${r.region_id}, "${r.region_name}", ${mapIdCode[parent]});`;
            fs.appendFileSync(`./src/api/db/backend/test/queries/${filename}.sql`, '\n' );
            fs.appendFileSync(`./src/api/db/backend/test/queries/${filename}.sql`, rContent.concat('\n') );
        }
        let pContent = p.insertStatement();
        fs.appendFileSync(`./src/api/db/backend/test/queries/${filename}.sql`, pContent.concat('\n') );
    }
    return database.query(`SELECT * FROM polygon WHERE polygon_id = 2073;`);
    
};

const custom2 = async () => {
    await database.query(`
        DELETE FROM mapRegion
        WHERE mapRegion_map_id > 3
        `, []).then( rows => {
            return rows.affectedRows;
    });
    return await database.query(`
        DELETE FROM map
        WHERE map_id > 3
        `, []).then( rows => {
            return rows.affectedRows;
    });
};

const printRegionInsertQuery = () => {
    US_States_Polygon_Parse.parse();
    return database.query(`SELECT * FROM region WHERE region_id = 1`);
};

export {
    custom,
    printRegionInsertQuery
};