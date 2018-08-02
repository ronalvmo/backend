var express = require('express');
var bcrypt = require('bcrypt');
var Usuario = require('../models/usuario');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var mdAutentication = require('../midlewares/autentication');

//inicializar variables
var app = express();


//body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//============================
//obtener todos los usuarios
//============================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role',
        (error, usu) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Usuarios!',
                    Errors: error
                });
            }
            res.status(200).json({
                ok: true,
                usuarios: usu
            });

        });


});



//============================
//Crear un nuevo usuario
//============================
app.post('/', mdAutentication.verificaToken, (req, res,) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Usuarios!',
                Errors: error
            });
        }
        res.status(201).json({
            ok: true,
            usuarioGuardado: usuarioGuardado,
            usuariotoken: req.usuarioDB
        });

    });


});


//============================
//Actualizar usuario
//============================
app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (error, usuario) => {


        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuarios!',
                Errors: error
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el Id:' + id + ' no existe',
                Errors: { message: 'No existe un usuario con ese Id' }
            });
        }

        usuario.nombre = body.nombre
        usuario.email = body.email
        usuario.role = body.role

        usuario.save((error, usuarioGuardado) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Usuarios!',
                    Errors: error
                });
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        })


    });



});

//============================
//elimina usuario usuario
//============================
app.delete('/:id', (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Usuarios!',
                Errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID!',
                Errors: {message: 'No existe un usuario con ese ID!'}
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});
module.exports = app;

