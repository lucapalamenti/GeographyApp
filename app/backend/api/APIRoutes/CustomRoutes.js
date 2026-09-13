import { Router, json } from 'express';

import { custom, printRegionInsertQuery } from '../db/CustomDAO.js';

const CustomAPIRouter = Router();
CustomAPIRouter.use( json() );

CustomAPIRouter.get('/custom', (req, res) => {
    custom().then( r => {
        res.json( r );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /custom'});
    });
});

CustomAPIRouter.post('/customPrint', (req, res) => {
    printRegionInsertQuery().then( r => {
        res.json( r );
    }).catch ( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /customPrint'});
    });
});

export default CustomAPIRouter;