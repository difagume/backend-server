var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken

var SEED = require('../config/config').SEED;

//=============================
// Verificar token
//=============================
exports.verficaToken = function (req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });
}


//=============================
// Verifica ADMIN
//=============================
exports.verficaAdminRole = function (req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    }
    else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede realizar esa acción' }
        });
    }
}

//=============================
// Verifica ADMIN o Mismo usuario
//=============================
exports.verficaAdmin_o_mismoUsuario = function (req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    }
    else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador ni es el mismo usuario, no puede realizar esa acción' }
        });
    }
}