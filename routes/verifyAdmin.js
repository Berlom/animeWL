const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
    role = req.user.role;
    if(role == "admin")
        next();
    else
        res.status(400).json({
            message: "only admin is allowed to make such action"
        });
}