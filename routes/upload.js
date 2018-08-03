var express = require('express');

var app = express();

var fileUpload = require('express-fileupload');

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


    res.status(200).json({
        ok: true,
        mensaje: 'archivo movido ',
        extensionArc: extArchivo
    });
});

module.exports = app;