var express = require('express');

var app = express();

var Usuario = require('../models/usuario');

//=============================
// Obtener todos los usuarios
//=============================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }
                // si no sucede ningun error
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            })
});


//=============================
// Crear un nuevo usuario
//=============================
app.post('/', (req, res) => {

    // Extraemos el body
    var body = req.body; // <-- usando el Body parser

    // Creamos un objeto de tipo Usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        img: body.img,
        role: body.role
    });

    // Para guardar
    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        // Si no sucede ningun error
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });

    });
});


module.exports = app;