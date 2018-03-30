var express = require('express');
var bcrypt = require('bcryptjs'); // https://github.com/dcodeIO/bcrypt.js
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

//=============================
// Autenticación de Google
//=============================
app.post('/google', (req, res) => {
    var token = req.body.token || '';

    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);
    const ticket = client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    });

    ticket.then(data => {
        res.status(200).json({
            ok: true,
            ticket: data.payload,
            userid: data.payload.sub
        });
    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }
    });
});


//=============================
// Autenticación normal
//=============================
app.post('/', (req, res) => {

    var body = req.body;

    // Verifico que existe el usuario con ese correo
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        // Si la contraseña no coincide entre el password enviado con el password de BD
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token (en este punto el correo y el password ya son correctos)
        usuarioBD.password = ':D';

        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id
        });

    });

});


// Lo exporto para ser usado en app.js
module.exports = app;