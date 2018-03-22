var express = require('express');
var bcrypt = require('bcryptjs'); // https://github.com/dcodeIO/bcrypt.js

var app = express();

var Usuario = require('../models/usuario');

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


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            id: usuarioBD._id
        });

    });

});




// Lo exporto para ser usado en app.js
module.exports = app;