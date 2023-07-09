const mysql = require("mysql");
/*
    VARIABLES A MODIFICAR PARA LOGRAR LA COMUNICACIÓN CON MYSQL
    MODIFICAR PARA LAS CREDENCIALES QUE SE CUENTEN
*/
const HOST_U = "localhost";
const USER_U = "root";
const PASS_U = "123";
const DATA_U = "servicio_web";
const cone = mysql.createConnection({
        host: HOST_U,
        user: USER_U,
        password: PASS_U,
        database: DATA_U
    });
cone.connect();

module.exports={
    cone
};