var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// =========================
//Busqueda por coleccion
// =========================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var expreg = new RegExp(busqueda, 'i')
    if (tabla == 'medico') {
        buscarMedicos(expreg).then((medicos) => {
            res.status(200).json({
                ok: true,
                medicos: medicos

            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                error: err
            });
        });
    } else if  ( tabla == 'hospital') {
        buscarHospitales(expreg).then((hospitales) => {
            res.status(200).json({
                ok: true,
                hospitales: hospitales

            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                error: err
            });
        });
    } else if  ( tabla == 'usuario') {
        buscarUsuarios(expreg).then((usuarios) => {
            res.status(200).json({
                ok: true,
                usuarios: usuarios

            });
        }).catch(err => {
            res.status(400).json({
                ok: false,
                error: err
            });
        });
    } else{
        res.status(400).json({
            ok: false,
            mensaje: 'Las colecciones permitidas son: usuario, medico, hospital'
        });
    }


});


// =========================
//Busqueda General
// =========================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var expreg = new RegExp(busqueda, 'i')

    Promise.all([buscarHospitales(expreg), buscarMedicos(expreg), buscarUsuarios(expreg)]).then(
        respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        }

    )



});

function buscarHospitales(expreg) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: expreg })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });
    });

}


function buscarMedicos(expreg) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: expreg })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }

            });
    });

}

function buscarUsuarios(expreg) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: expreg }, { email: expreg }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            })
    });

}
module.exports = app;