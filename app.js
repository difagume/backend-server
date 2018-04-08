// Requires (librerias)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const favicon = require('express-favicon');

// Inicializar variables
var app = express();

app.use(favicon(__dirname + '/public/favicon.png'));

// Control de acceso HTTP (CORS)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json

// Importar rutas
var appRoutes = require('./routes/app');
var medicoRoutes = require('./routes/medico');
var hospitalRoutes = require('./routes/hospital');
var usuarioRoutes = require('./routes/usuario');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');


// Conexión a la base de datos
// mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
mongoose.connection.openUri('mongodb://difagume:cluisa5013@ds231589.mlab.com:31589/hospitaldb', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

})

// Server index config --> https://github.com/expressjs/serve-index
// Permite ver los directorios y losarchivos desde el navegador
// En este caso sería de entrar a: http://localhost:3000/uploads/
/* var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads')); */


// Rutas
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/login', loginRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(5000, () => {
    console.log('Express server puerto 5000: \x1b[32m%s\x1b[0m', 'online');

});