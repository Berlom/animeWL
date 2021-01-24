const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
    const token = req.header("Authorization");
    if(!token){
        res.send('cannot split undefined token');
    }
    TokenArray = token.split(" ");
    if(!TokenArray){
        res.status(422).send('access denied');
    }
    try{
        const verified = jwt.verify(TokenArray[1],process.env.SECRET_TOKEN);
        req.user = verified;
        next();
    }catch(err){
        res.status(400).send(err);
    }
}