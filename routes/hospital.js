var express = require('express');
var Hospital = require('../models/hospital');


var bodyParser = require('body-parser');

var mdAutentication = require('../midlewares/autentication');

//inicializar variables
var app = express();


//body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//============================
//obtener todos los hospitales
//============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre img usuario',(error, hospital) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando Hospitales!',
                    Errors: error
                });
            }

            Hospital.count({},(err,conteo) => {
                res.status(200).json({
                    ok: true,
                    hospital: hospital,
                    total: conteo
                });
            })
            
        
        }).populate('usuario','nombre email').skip(desde).limit(5);

    });

//============================
//Crear un nuevo hospital
//============================
app.post('/', mdAutentication.verificaToken, (req, res, ) => {

    var body = req.body;

    /*  res.status(201).json({
        ok: true,
        usuariodb: req.usuarioDB,
        id:  req.usuarioDB

    }); */
 
       var hospital = new Hospital({
         nombre: body.nombre,
         usuario: req.usuarioDB._id
      });
 
     hospital.save((error, hospitalGuardado) => {
         if (error) {
             return res.status(400).json({
                 ok: false,
                 mensaje: 'Error al crear hospital!',
                 Errors: error
             });
         }
         res.status(201).json({
             ok: true,
             hospitalGuardado: hospitalGuardado,
        
         });
 
     });  


});


//============================
//Actualizar hospital
//============================
 app.put('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (error, hospital) => {


        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Hospitales!',
                Errors: error
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el Id:' + id + ' no existe',
                Errors: { message: 'No existe un hospital con ese Id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuarioDB._id;
        hospital.save((error, hospitalGuardado) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar Hospitales!',
                    Errors: error
                });
            }
            res.status(200).json({
                ok: true,
                usuario: hospitalGuardado
            });

        })


    });
});
 
//============================
//elimina hospital
//============================
app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Hospitales!',
                Errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID!',
                Errors: { message: 'No existe un hospital con ese ID!' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });

    });
}); 
module.exports = app;

