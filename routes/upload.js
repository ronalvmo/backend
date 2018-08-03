var express = require('express');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var fileUpload = require('express-fileupload');

var fs = require('fs');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de colecciones
    var tiposValidos = ['hospital', 'medico', 'usuario'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no es valida!',
            Errors: { mensaje: 'tipo de coleccion no es valida' }
        });

    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada!',
            Errors: { mensaje: 'debe selecionar una imagen' }
        });
    }

    //obtener el nombre del archivo
    var archivo = req.files.imagen;
    var splitArchivo = archivo.name.split('.');
    var extArchivo = splitArchivo[splitArchivo.length - 1];

    //validacion de extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida!',
            Errors: { mensaje: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ') }
        });
    }

    //nombre de archivo personalizado
    //435235245-3434.png
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extArchivo}`;

    //mover el archivo del temporal a un path especifico 
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo!',
                Errors: { mensaje: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ') }
            });
        }
    });
    subirArchivoPorTipo(tipo, id, nombreArchivo, res);


});

function subirArchivoPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuario') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'no existe el id de usuario solicitado '
                });

            }


            var pathAnterior = './uploads/usuario/' + usuario.img;
            //si existe elimina la imagen anterior 
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada ',
                    Usuario: usuarioActualizado
                });
            });
        })
    }
    if (tipo === 'hospital') {
        Hospital.findById(id, (err, hospital) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'no existe el id de hospital solicitado '
                });

            }

            var pathAnterior = './uploads/hospital/' + hospital.img;
            //si existe elimina la imagen anterior 
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada ',
                    hospital: hospitalActualizado
                });
            });
        })
    }
    if (tipo === 'medico') {
        Medico.findById(id, (err, medico) => {
            
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'no existe el id de medico solicitado '
                });

            }

            var pathAnterior = './uploads/medico/' + medico.img;
            
            //si existe elimina la imagen anterior 
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada ',
                    medico: medicoActualizado
                });
            });
        })
    }
}

module.exports = app;