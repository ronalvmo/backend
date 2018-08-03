//requires cargar librerias propias o de terceros
var express = require('express');

var mongoose = require('mongoose');

//inicializar variables

var app = express();

//importar rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');

//conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDb', (error, res) => {
    if (error) throw err;
    console.log('Base de datos \x1b[32m%s\x1b[0m', 'online');

});


//rutas
app.use('/busqueda',busquedaRoutes);
app.use('/medico',medicoRoutes);
app.use('/hospital',hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000 \x1b[32m%s\x1b[0m', 'online');
});