var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

//=============================
// Obtener todos los hospitales
//=============================
app.get('/', (req, res, next) => {

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }
                // si no sucede ningun error
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
            })
});


//=============================
// Crear un nuevo hospital
//=============================
app.post('/', mdAutenticacion.verficaToken, (req, res) => {

    // Extraemos el body
    var body = req.body; // <-- usando el Body parser

    // Creamos un objeto de tipo Hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    // Para guardar
    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        // Si no sucede ningun error
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });
});


//=============================
// Actualizar hospital
//=============================
app.put('/:id', mdAutenticacion.verficaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) { // Si viene null

            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        // Actualizo la info del hospital
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        // Grabar la info
        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            // Si no sucede ningun error
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});


//==============================
// Borrar un hospital por el id
//==============================
app.delete('/:id', mdAutenticacion.verficaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        // Validación
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    })

});


// Lo exporto para ser usado en app.js
module.exports = app;