var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

//=============================
// Obtener todos los medicos
//=============================
app.get('/', (req, res, next) => {

    Medico.find({})
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico',
                        errors: err
                    });
                }
                // si no sucede ningun error
                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });
            })
});


//=============================
// Crear un nuevo medico
//=============================
app.post('/', mdAutenticacion.verficaToken, (req, res) => {

    // Extraemos el body
    var body = req.body; // <-- usando el Body parser

    // Creamos un objeto de tipo Medico
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    // Para guardar
    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        // Si no sucede ningun error
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });
});


//=============================
// Actualizar medico
//=============================
app.put('/:id', mdAutenticacion.verficaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) { // Si viene null

            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        // Actualizo la info del medico
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        // Grabar la info
        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            // Si no sucede ningun error
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});


//==============================
// Borrar un medico por el id
//==============================
app.delete('/:id', mdAutenticacion.verficaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        // Validación
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    })

});


// Lo exporto para ser usado en app.js
module.exports = app;