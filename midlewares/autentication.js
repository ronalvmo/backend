
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


//============================
//Verificar Token(midleware)
//============================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                Errors: err

            });
        }

       
        req.usuarioDB = decoded.usuarioDB;
       

/* 
           return res.status(401).json({
            ok: true,
            decoded: decoded,
            request: req.usuarioDB
        }); */   
        next();

    });

}



