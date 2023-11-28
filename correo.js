var nodemailer = require('nodemailer');

var opcionesCorreo = {
    from : 'app2bfit@gmail.com'
}

/*
var transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        type : 'OAuth2',
        user : "app2bfit@gmail.com",
        pass : "",
        clientId : "",
        clientSecret : "",
        refreshToken : ""
    }
});
*/

function crearOpcionesCorreo(correoDestino, titulo, texto){
    opcionesCorreo.to = correoDestino;
    opcionesCorreo.subject = titulo;
    opcionesCorreo.html = texto;
}

function enviaCorreo(callback){
    transporter.sendMail(opcionesCorreo, (error, info) => {
        if(error){
            console.log(error)
            let objeto = {
                mensaje : "No se pudo realizar el envio",
                OK : 0,
                objeto : error
            };
            callback(objeto);
        }else{
            let objeto = {
                mensaje : "Correo enviado.",
                OK : 1,
                objeto : info
            };
            callback(objeto);
        }
    });
}

module.exports = {
    crearOpcionesCorreo, opcionesCorreo, enviaCorreo
}