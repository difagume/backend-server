var express = require('express');
var bcrypt = require('bcryptjs'); // https://github.com/dcodeIO/bcrypt.js
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//=============================
// Obtener todos los usuarios
//=============================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {

                    // si no sucede ningun error
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                })



            })
});


//=============================
// Crear un nuevo usuario
//=============================
// app.post('/', mdAutenticacion.verficaToken, (req, res) => {
app.post('/', (req, res) => {

    // Extraemos el body
    var body = req.body; // <-- usando el Body parser

    // Creamos un objeto de tipo Usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    // Para guardar
    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        // Si no sucede ningun error
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });
});


//=============================
// Actualizar usuario
//=============================
app.put('/:id', mdAutenticacion.verficaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) { // Si viene null

            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        // Actualizo la info del usuario (Opción 1)
        /*usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;*/

        // Actualizo la info del usuario (Opción 2)
        Object.keys(req.body).forEach(key => {
            usuario[key] = req.body[key];
        });

        // Grabar la info
        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            // para no imprimir el password
            usuarioGuardado.password = ';)';

            // Si no sucede ningun error
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });

        });

    });

});


//==============================
// Borrar un usuario por el id
//==============================
app.delete('/:id', mdAutenticacion.verficaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        // Validación
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });

    })

});


// Lo exporto para ser usado en app.js
module.exports = app;
