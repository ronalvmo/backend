var express = require('express');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

//inicializar variables
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;
    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuarios!',
                Errors: error
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas- email!',
                Errors: error
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas- password!',
                Errors: error
            });
        }

        // Crear un token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuarioDB }, SEED, { expiresIn: 14400 }); //4horas 

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    })


});

module.exports = app;