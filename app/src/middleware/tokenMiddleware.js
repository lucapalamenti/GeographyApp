const jwt = require('jsonwebtoken');

const TOKEN_COOKIE_NAME = "GeographyAppToken";
// Use the API_SECRET environment variable here
const API_SECRET = process.env.API_SECRET_KEY;

exports.TokenMiddleware = (req, res, next) => {
    let token;

    // If a token (stored as a cookie) already exists in the browser
    if ( req.cookies[TOKEN_COOKIE_NAME] ) {
        token = req.cookies[ TOKEN_COOKIE_NAME ];
    } else {
        const authHeader = req.get('Authorization');
        // If a token is stored in the authorization header
        if ( authHeader && authHeader.startsWith("Bearer ") ) {
            // Format should be "Bearer [token]" but we only need the token
            token = authHeader.split(" ")[1].trim();
        } else {
            // At this point we know a token doesn't exist
            res.status(401).json({error: 'Not authenticated'});
            return;
        }
    }

    // At this point we found a token. Now we need to validate it
    try {
        const decodedPayload = jwt.verify( token, API_SECRET );
        // ...
        // ... Do something, like setting a variable in the req to part of the payload
        // ...
        req.user = decodedPayload.user;
        // Call the next middleware
        next();
    } 
    // Token is invalid
    catch {
        res.status(401).json({error: 'Not authenticated'});
        return;
    }
};

exports.generateToken = (req, res, user) => {
    let payload = {
        user: user,
        // Token expires in 60 minutes
        exp: Math.floor( Date.now() / 1000 ) + 60 * 60
    };

    const token = jwt.sign( payload, API_SECRET );

    // Send token in cookie to client
    res.cookie(TOKEN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        // Session expires in 15 minutes
        maxAge: 15* 60 * 1000
    });
};

exports.removeToken = (req, res) => {
    res.cookie(TOKEN_COOKIE_NAME, "", {
        httpOnly: true,
        secure: true,
        maxAge: -1 // A date in the past
    });
};