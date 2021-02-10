const jwt = require('jsonwebtoken'); //Package pour vérifier les tokens

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; //On recupère le token dans le header
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); //On decode et on vérifie 
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) { //On vérifie le token de la requête avec celui du token
            throw 'Invalid user ID';
        } else {
            next(); //Si tout se passe bien on peut passer aux fontions dans les controlleurs
        }
    } catch {
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};