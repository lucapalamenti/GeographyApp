const express = require('express');

const CustomDAO = require('../db/CustomDAO.js');

const CustomAPIRouter = express.Router();
CustomAPIRouter.use( express.json() );

CustomAPIRouter.get('/custom', (req, res) => {
    CustomDAO.custom().then( r => {
        res.json( r );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /custom'});
    });
});

CustomAPIRouter.post('/customPrint', (req, res) => {
    CustomDAO.printRegionInsertQuery().then( r => {
        res.json( r );
    }).catch ( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /customPrint'});
    });
});

module.exports = CustomAPIRouter;