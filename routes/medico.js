var express = require('express');
var Medico = require('../models/medico');
var bodyParser = require('body-parser');

var mdAutentication = require('../midlewares/autentication');

//inicializar variables
var app = express();


//body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//============================
//obtener todos los medicos
//============================
app.get('/', (req, res, next) => {
    
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital',
        (error, medico) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Medicos!',
                    Errors: error
                });
            }

            Medico.count({},(err,conteo) => {
                res.status(200).json({
                    ok: true,
                    Medico: medico,
                    Total: conteo
                });
            })
            

        }).populate('usuario','nombre email').populate('hospital').skip(desde).limit(5);


});



//============================
//Crear un nuevo medico
//============================
 app.post('/', mdAutentication.verificaToken, (req, res, ) => {

    var body = req.body;

      /* res.status(201).json({
        ok: true,
        usuariodb: req.usuarioDB,
        id:  req.usuarioDB

    });  */
 
       var medico= new Medico({
         nombre: body.nombre,
         usuario: req.usuarioDB._id,
         hospital: body._id
      });
 
     medico.save((error, medicoGuardado) => {
         if (error) {
             return res.status(400).json({
                 ok: false,
                 mensaje: 'Error al crear medico!',
                 Errors: error
             });
         }
         res.status(201).json({
             ok: true,
             medicoGuardado: medicoGuardado,
         });
 
     });  


}); 


//============================
//Actualizar medicos
//============================
app.put('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (error, medico) => {


        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Medicos!',
                Errors: error
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el Id:' + id + ' no existe',
                Errors: { message: 'No existe un medico con ese Id' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuarioDB._id;
        medico.hospital = body._id;
        medico.save((error, medicoGuardado) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico!',
                    Errors: error
                });
            }
            res.status(200).json({
                ok: true,
                usuario: medicoGuardado
            });

        })


    });
}); 
 
//============================
//elimina hospital
//============================
 app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico!',
                Errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID!',
                Errors: { message: 'No existe un medico con ese ID!' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });

    });
});  
module.exports = app;

