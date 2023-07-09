const express = require("express");
const bodyparser = require("body-parser");
const conexion = require("./conexionBD");

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Funcionamiendo del servidor de Node.js");
});

//PRUEBA DE FUNCIONAMIENTO DE CONEXION A LA BD Y OBTENCIÓN DE DATOS
app.get("/data", (req, res) => {
  const conn = conexion.cone;
  conn.query("select * from usuarios", (err, result) => {
    console.log(result);
    for(let i= 0; i < result.length; i++){
        res.json({
            data_user: {
              "id": ""+result[i].id_usuario,
              "email": ""+result[i].email,
              "fecha_N": ""+result[i].fecha_nacimiento,
            },
          });
    }
  });
});

app.get("/prueba", (req, res) => {
  res.json({ mensaje: "info entrada" });
});

app.listen(3000, "192.168.100.9", function () {
  console.log("Funcionando en el puerto: 3000");
});
app.use(function (req, res) {
  res.status(404).send("Error");
});

//para ejecutar el comando de configuración es npm run dev, dev se cambia dependiendo del script a ejecutar
