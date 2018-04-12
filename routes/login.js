var express = require('express');
var bcrypt = require('bcryptjs'); // https://github.com/dcodeIO/bcrypt.js
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken

var SEED = require('../config/config').SEED;
var CADUCIDAD_TOKEN = require('../config/config').CADUCIDAD_TOKEN;

var app = express();

var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

var mdAutenticacion = require('../middlewares/autenticacion');

//=============================
// Renovar token
//=============================
app.get('/renuevatoken', mdAutenticacion.verficaToken, (req, res) => {

    let token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: CADUCIDAD_TOKEN });

    return res.status(200).json({
        ok: true,
        //usuario: req.usuario,
        token: token
    });

});


//=============================
// Autenticación de Google
//=============================
/* async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async (req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Error en el login de Google',
                errors: { message: 'Token no válido' },
                err: e
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en el login de Google',
                    errors: { message: 'Debe de usar su autenticación normal' }
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: CADUCIDAD_TOKEN });
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: CADUCIDAD_TOKEN });
                //var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuario.role)
                });
            });
        }
    });
}); */


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
                mensaje: 'Error en el login',
                errors: { message: 'Credenciales incorrectas - email' }
            });
        }

        // Si la contraseña no coincide entre el password enviado con el password de BD
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en el login',
                errors: { message: 'Credenciales incorrectas - password' }
            });
        }

        // Crear un token (en este punto el correo y el password ya son correctos)
        usuarioBD.password = ':D';

        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: CADUCIDAD_TOKEN });

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
            menu: obtenerMenu(usuarioBD.role)
        });

    });

});


function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge', // material design
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                /* { titulo: 'Usuarios', url: '/usuarios' }, */
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' }
            ]
        }
    ];

    // console.log('ROL: ', ROLE);
    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}


// Lo exporto para ser usado en app.js
module.exports = app;