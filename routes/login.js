var express = require('express');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

//google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


var SEED = require('../config/config').SEED;

//inicializar variables
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var Usuario = require('../models/usuario');

//==============================================
//Autenticacon de Google
//==============================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }
}

app.post('/google', async (req, res) => {

    var token = req.body.token;
    

    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'

            });

        });


    Usuario.findOne({ email: googleUser.email }, (error, usuario) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuarios!',
                Errors: error
            });
        }

        if (usuario) {
            if (usuario.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'

                });
            } else {
                var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 }); //4horas 

                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    id: usuario._id
                });
            }
        }

        else {
            //El usuario debe ser creadono existe
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuario) => {
                var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 }); //4horas 

                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    id: usuario._id
                });

            })

        }

    });




    /* return res.status(200).json({
        ok: true,
        mensaje: 'Ok!!!',
        googleUser: googleUser

    }); */

});


//==============================================
//Autenticacon normal
//==============================================


app.post('/', (req, res) => {
    console.log(req.body);
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