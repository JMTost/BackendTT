const express = require("express");
const bodyparser = require("body-parser");
const conexion = require("./conexionBD");
//para las pruebas locales haremos uso de cors debido a que este metodo bloquea el mismo origen
const cors = require("cors");
const fileUpload = require("express-fileupload");
let fs = require('node:fs'); //obtenemos el filesystem de node
//dependencia de video
const videos = require("./videos_redimensionar");
  
//archivo de peticiones
const apis = require("./peticiones");


const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
//usamos cors
app.use(cors({ origin: "*" }));
//express-fileupload dependencia que nos permite obtener archivos desde el form-data de una petición
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Funcionamiendo del servidor de Node.js");
  const fecha = new Date();
  //fecha.toLocaleDateString()
  console.log(fecha.toLocaleDateString());
});

//PRUEBA DE FUNCIONAMIENTO DE CONEXION A LA BD Y OBTENCIÓN DE DATOS
app.get("/data", (req, res) => {
  const conn = conexion.cone;
  //console.log(__dirname) obtenemos el path de donde se encuentra el archivo actual
  
/*
  conn.query("select * from usuarios", (err, result) => {
    if (err){
      res.send(err).status(500);
      throw err;
    }
    else {
      console.log(result);
      for (let i = 0; i < result.length; i++) {
        res.json({
          data_user: {
            id: "" + result[i].id_usuario,
            email: "" + result[i].email,
            fecha_N: "" + result[i].fecha_nacimiento,
          },
        });
      }
      //otra forma mas sencilla de hacer la impresion de info
    //  req.array.forEach(element => {
  //    console.log(element);
//    });
    
    }
  });
  */
});

app.get("/prueba", (req, res) => {
  apis.apiTiempo()
  .then(data => {//obtenemos la fecha actual en CDMX
    //separamos los elementos
    let partes = data.split('-');
    const anoAPI = partes[0];
    const mesAPI = partes[1];
    const diaAPI = partes[2];
    console.log(partes);
    res.send(data);
  })
  .catch(error => {
    console.error("Error dentro de la petición", error);
    res.send(error);
  });
/*
  var valor;
  apis.apiTiempo().then(json => {
    valor = json;
    console.log(json);
    res.json({ mensaje: "info entrada", data:json});
  });
*/
});

app.post("/pruebaFecha", (req, res) => {
    let fechaUser = req.body.fecha;
    let fechaUserSeparada = fechaUser.split('/');//caso que debemos definir o normalizar 
    console.log(fechaUser);
});

  //prueba de obtención de archivos
app.post("/cargaArchivos", (req, res) => {
  const conn = conexion.cone;
  let archivoObtenido = req.files.archivo;
  let id = req.body.id; 
  if(archivoObtenido.length > 1){
    for(let i = 0; i < archivoObtenido.length; i++){
      const query = "INSERT INTO archivos VALUES (?, ?, ?)";
      conn.query(query, [id, id+' '+archivoObtenido[i].name, archivoObtenido[i].data], (error, resultInsert) => {
        if(error){
          throw error;
        }
      });
    }
    res.status(200).send({mensaje : 'archivo cargado'});
  }else{
    const query = "INSERT INTO archivos VALUES (?, ?, ?)";
      conn.query(query, [id, id+' '+archivoObtenido.name, archivoObtenido.data], (error, resultInsert) => {
        if(error){
          throw error;
        }else{
          res.status(200).send({mensaje : 'archivo cargado'});
        }
      });
  }
    /*
    //creamos el archivo dentro de la carpeta 'archivos'
    archivoObtenido[i].mv(`./archivos/${archivoObtenido[i].name}`, err => {
      if(err){
        return res.status(500).send({mensaje : err});
      }
    });
    */
});

//METODOS DE ALTA DE INFORMACIÓN

app.post("/altaprofesionales", (req, res) => {
  //valores a almacenar:
  /*
    nombre, apPaterno, apMaterno, email, edad, fechaN, pass, tipo, archivos, valido = 0
    */
  if (JSON.stringify(req.body) === "{}") {
    //validamos que el contenido de la petición no este vació
    console.error("req vacio");
    res.status(500).send({ error: "sin informacion" });
  } else {
    //validamos que cada elemento que deseamos almacenar no se encuentre vacio
    if (req.body.nombre === "" || req.body.apPaterno === "" || req.body.apMaterno === "" || req.body.email === "" ||( req.body.edad < 0 || req.body.edad > 100) || req.body.fechaN === "" || req.body.pass === "" ) {
      console.log("error no hay datos completos");
      res.status(500).send("Error. Datos incompletos");
    } else {
      const conn = conexion.cone;
      let correo = req.body.email;
      //comprobamos que no haya un registro de este correo
      conn.query(`SELECT id_profesional FROM usuarios_profesionales WHERE email = '${correo}'`, (errorB, resultB) => {
        if(resultB.length > 0){
          //marcamos un error
          console.log("error");
          res.status(500).send({error:"Profesional ya existente"});
        }else{
           //hacemos la inserción en la base de datos
            //let info = `INSERT INTO usuarios_profesionales VALUES (0, '${req.body.nombre}', '${req.body.apPaterno}', '${req.body.apMaterno}', '${req.body.email}', ${req.body.edad}, '${req.body.fechaN}', '${req.body.pass}', ${req.body.tipo}, '0')` //en este caso el valor de valido se pone en 0, debido a que debe entrar en proceso de validar los documentos que proporcione
            conn.query(`INSERT INTO usuarios_profesionales VALUES (0, '${req.body.nombre}', '${req.body.apPaterno}', '${req.body.apMaterno}', '${req.body.email}', ${req.body.edad}, '${req.body.fechaN}', '${req.body.pass}', ${req.body.tipo}, '0')`, function (errInsert, resultInsert) {
              if (errInsert) throw errInsert;
                else {
                  console.log(resultInsert.affectedRows);
                  res.status(200).send({mensaje : "Creacion exitosa de usuario"});
                }
              }
            );
            /*  EN ESTE CASO YA NO SERÁ NECESARIO OBTENER LOS ARCHIVOS AL MOMENTO DE CREAR AL USUARIO, SERÍA MEJOR HACER UNA INTERFAZ PARA EL ENVIO DE LOS ARCHIVOS
            //inserción de los archivos del profesional, para este caso haremos un recorrido de la cantidad de los archivos
            //let obten_id = `SELECT id_profesional FROM usuarios_profesionales WHERE email = ${correo}`;
            conn.query(`SELECT id_profesional FROM usuarios_profesionales WHERE email = '${correo}'`, function (err, rows) {
                if (err) throw err;
                else {
                  var id = rows[0].id_profesional;
                  //dentro de esta query realizamos la inserción de los archivos
                  //hacemos la inserción de los archivos, en este caso debemos de considerar la longitud de los archivos
                  //let insertaArchivos = `INSERT INTO archivos VALUES (${obten_id}, '${req.body.archivos[0]}')`;
                  for (let i = 0; i < req.body.archivos.length; i++) {
                    conn.query(
                      `INSERT INTO archivos VALUES (${id}, '${req.body.archivos[i]}')`,
                      function (error, result) {
                        if (error) throw error;
                        else {
                          console.log(result.affectedRows);
                        }
                      }
                    );
                  }
                }
              }
            );
            */
        }
      });
    }
  }
});

app.post("/altaPacientes", (req, res) => {
  if(JSON.stringify(req.body) === "{}"){
    //comprobamos que el body de la petición no se encuentre vacio
    console.log("req vacio");
    res.status(500).send({ error: "sin informacion" });
  }else{//contiene información, de modo que validamos cada uno de los elementos que deseamos almacenar
    if(req.body.nombre === "" || req.body.apPaterno === "" || req.body.apMaterno === "" || req.body.email === "" ||( req.body.edad < 0 || req.body.edad > 100) || req.body.fechaN === "" || req.body.numTel === "" || req.body.pass === "" || req.body.idProfesional === ""){
      console.log("error no hay datos completos");
      res.status(500).send("Error. Datos incompletos");
    }else{
      const conn = conexion.cone;
      let correo = req.body.email;
      //Comprobamos que no haya un registro de este correo previamente
      conn.query(`SELECT email FROM usuarios_pacientes WHERE email = '${correo}'`, (errorB, resultB) => {
        if(errorB){
          res.send(errorB).status(500);
          throw errorB;
        }else{
          if(resultB.length > 0){
            //marcamos error debido a que existe un email con el mismo valor
            console.log("error al insertar un nuevo paciente");
            res.status(500).send({error:"Paciente ya existente"});
          }else{
            //hacemos la inserción en la base de datos
            conn.query(`INSERT INTO usuarios_pacientes VALUES (0, '${req.body.nombre}', '${req.body.apPaterno}', '${req.body.apMaterno}', '${correo}', ${req.body.edad}, '${req.body.fechaN}', '${req.body.numTel}', '${req.body.pass}', ${req.body.idProfesional})`, function(errInsert, resultInsert){
              if(errInsert){
                res.send(errInsert).status(500);
                throw errInsert;
              }else{
                //podemos realizar la creación del historial de profesionales
                  //obtenemos el id del paciente
                conn.query(`SELECT id_paciente FROM usuarios_pacientes WHERE email = '${correo}'`, (errorBid, resultBid) => {
                  if(errorBid) throw errorB;
                  else{
                    let id = resultBid[0].id_paciente;
                    //obtenemos la fecha de forma local del dispositivo
                    const fecha = new Date(); 
                    let fechaAct = fecha.toLocaleDateString();//en este casi se almacena de forma DD/M/YYYY
                    //creamos el historial EN ESTE CASO DEJAMOS EL VALOR DE TERMINO SERA NULO DEBIDO A QUE NO SE CONOCE LA VIGENCIA
                    conn.query(`INSERT INTO historial_profesionales VALUES (${id}, ${req.body.idProfesional}, '${fecha.getFullYear()+'/'+(fecha.getMonth()+1)+'/'+fecha.getDate()}', ${null})`, (errorIhistorial, resultIhistorial) => {
                      if(errorIhistorial) throw errorIhistorial;
                      else{
                        console.log("Creación de usuario e historial exitoso");
                        res.send({mensaje:"Creación exitosa"}).status(200);
                      }
                    });
                  }
                });
                //res.send({mensaje:"Creación exitosa"}).status(200);
              }
            });
          }
        }
      });
    }

  }
});

app.post("/creacionCitas", (req, res) => { //operación debe ser disponible solo para aquellos usuarios profesionales que se encuentren validados
  //informacion a obtener: id del tipo de cita, profesional, paciente, fecha y hora (dentro del mismo)
  if(JSON.stringify(req.body) === "{}"){
    //validamos que el contenido de la petición no este vació
    console.log("req vacio");
    res.status(500).send({error:"sin informacion"});
  } else {//validamos que cada elemento a almacenar no se encuentren vacios
    if(req.body.idTipoCita === "" || req.body.idProfesional === "" || req.body.idPaciente === "" || req.body.fechaHora === "" ){
      console.log("Error no hay datos completos");
      res.status(500).send("Error. Datos incompletos");
    } else {
      //consideramos que al momento de crear dicha cita, los datos se encuentren previamente validados
      const conn = conexion.cone;
      conn.query(`INSERT INTO citas VALUES (${req.body.idTipoCita}, ${req.body.idProfesional}, ${req.body.idPaciente}, '${req.body.fechaHora}')`, (errorInsert, resultInsert) => {
        if(errorInsert) throw errorInsert;
        else{
          console.log(resultInsert.affectedRows);
          res.status(200).send("Creación de cita correcta");
        }
      });
    }
  }
});

app.post("/creacionProximaCita", (req, res) => {
  if(JSON.stringify(req.body) === "{}"){
     //validamos que el contenido de la petición no este vació
    console.log("req vacio");
    res.status(500).send({error:"sin informacion"});
  }else{//validamos que cada elemento a almacenar no se encuentren vacios
    if(req.body.idProfesional === "" || req.body.idPaciente === "" || req.body.fechaHora === ""){
      console.log("Error no hay datos completos");
      res.status(500).send("Error. Datos incompletos");
    }else{
      //consideramos que los datos se encuentran validados para la proxima cita
      const conn = conexion.cone;
      conn.query(`INSERT INTO proximas_citas VALUES (${req.body.idProfesional}, ${req.body.idPaciente}, '${req.body.fechaHora}')`, (errorInsert, resultInsert) => {
        if(errorInsert) throw errorInsert;
        else{
          console.log(resultInsert.affectedRows);
          res.status(200).send("Creación de cita correcta");
        }
      });
    }
    
  }
});

  //METODO PARA EL ENVIO DE IMG DE USUARIO PROFESIONAL 
  /*
    para el caso de cargaArchivos y estos metodos, el body debe cumplir con un requisito de envio, el cual es, se debe enviar mediante form-data, donde los campos a utilizar son:
      img de tipo file, el cual debe ser a lo mucho una imagen y el id de tipo texto, el cual nos pemitirá hacer el registro de este archivo
  */
app.post("/altaFotoProfesional", (req, res) => {//validamos desde el cliente que solo se podra seleccionar un solo archivo
  const conn = conexion.cone;
  //obtenemos el archivo y el id del profesional
  let archivoObtenido = req.files.img;
  let id = req.body.id;
  let extension = archivoObtenido.name.split('.');
    //console.log(extension[1])
  //podemos hacer un select para comprobar que no exista una imagen previa y con ello, si hay, eliminar y subir la nueva, sino crear el registro
  conn.query(`SELECT * FROM imgUsuariosProfesionales WHERE id_profesional = ${id}`, (errBusqueda, resultBusqueda) => {
    if(errBusqueda){
      res.status(500).send(errBusqueda);
      throw errBusqueda;
    }else{
      if(resultBusqueda.length > 0){//eliminamos la imagen
        conn.query(`DELETE FROM imgUsuariosProfesionales WHERE id_profesional = ${id}`, (errorBorrado, resultBorrado) => {
          if(errorBorrado){
            res.status(500).send({mensaje : "Error al borrar la img pasada"});
            throw errorBorrado;
          }else{
            const query = "INSERT INTO imgUsuariosProfesionales VALUES (?, ?, ?)";
            conn.query(query, [id, extension[1], archivoObtenido.data], (error, resultInsert) => {
              if(error){
                res.status(500).send({error : error});
                throw error;
              }else{
                res.status(200).send({mensaje : "Imagen subida y eliminada la anterior"});
              }
            });
          }
        });
      }else{//creamos la imagen
        const query = "INSERT INTO imgUsuariosProfesionales VALUES (?, ?, ?)";
        conn.query(query, [id, extension[1], archivoObtenido.data], (error, resultInsert) => {
          if(error){
            res.status(500).send({error : error});
            throw error;
          }else{
            res.status(200).send({mensaje : "Imagen subida"});
          }
        });
      }
    }
  });
});

  //METODO PARA EL ENVIO DE IMG DE USUARIO PACIENTE
    /*
      para este caso, es similar al metodo altaFotoProfesional, el cual se debe enviar mediante form-data, donde los campos son:
        img de tipo file, el cual debera ser solo una imagen (un archivo) y el id de tipo texto 
    */
app.post("/altaFotoPaciente", (req, res) => {
  const conn = conexion.cone;
  let archivoObtenido = req.files.img;
  let id = req.body.id;
  let extension = archivoObtenido.name.split('.');
  //Hacemos un select para comprobar que no exista una imagen previa y si hay, eliminarla y subir la nueva, sino crear el archivo 
  conn.query(`SELECT * FROM imgUsuariosPacientes WHERE id_paciente = ${id}`, (errBusqueda, resultBusqueda) => {
    if(errBusqueda){
      res.send(500).send({error : errBusqueda});
      throw errBusqueda;
    }else{
      if(resultBusqueda.length > 0){//contamos con una imagen previa
        conn.query(`DELETE FROM imgUsuariosPacientes WHERE id_paciente = ${id}`, (errorBorrado, resultBorrado) => {
          if(errorBorrado){
            res.status(500).send({mensaje : "Error al borrar la img pasada"});
            throw errorBorrado;
          }else{
            const query = "INSERT INTO imgUsuariosPacientes VALUES (?, ?, ?)";
            conn.query(query, [id, extension[extension.length - 1], archivoObtenido.data], (errorInsert, resultInsert) => {
              if(errorInsert){
                res.status(500).send({mensaje : errorInsert});
                throw errorInsert;
              }else{
                res.status(200).send({mensaje : "Imagen subida y eliminada la pasada"});
              }
            });
          }
        });
      }else{//creamos el registro de la imagen
        const query = "INSERT INTO imgUsuariosPacientes VALUES (?, ?, ?)";
        conn.query(query, [id, extension[extension.length - 1], archivoObtenido.data], (errorInsert, resultInsert) => {
          if(errorInsert){
            res.status(500).send({mensaje : errorInsert});
            throw errorInsert;
          }else{
            res.status(200).send({mensaje : "Imagen subida"});
          }
        });
      }
    }
  });
});

  //METODO PARA LA SUBIDA DE VIDEOS Y CAMBIO DE RESOLUCIÓN DEL MISMO
    /*
      obtendremos de la misma manera que en los metodos de obtención de imagenes el video y el id del profesional que lo sube, seguido haremos la conversión de resolución de este a 360
     */
app.post("/altaVideoProfesional", (req, res) => {
  let archivoObtenido = req.files.video;
  let id = req.body.id;
  //creamos las carpetas de /archivos/videosProfesionales/ y de video_id
  const folderBase = __dirname+"/archivos/videosProfesionales";
  try{
    if(!fs.existsSync(folderBase)){
      fs.mkdir(folderBase, function(errorFolderB){
        if(errorFolderB){
          console.log(errorFolderB);
          res.send({
            mensaje : "No se pudo crear la carpeta videosProfesionales",
            error : errorFolderB
          });
        }else{
          const folderVideo = __dirname+"/archivos/videosProfesionales/video_"+id;
          try {
            if(!fs.existsSync(folderVideo)){
              fs.mkdir(folderVideo, function(error){
                if(error){
                  console.log(error);
                  res.send({
                    mensaje : "No se pudo crear la carpeta del id",
                    error : error
                  });
                }else{
                  var url = `${folderVideo}/${id}_${archivoObtenido.name}`;
                  fs.writeFile(url, archivoObtenido.data, (errorWrite) => {
                    if(errorWrite){
                      console.log("Error escritura de archivos", errorWrite);
                    }else{
                      videos.pasar360(url, folderVideo, id, archivoObtenido.name, (resultado)=>{
                        res.send(resultado);
                      });
                    }
                  });
                }
              });
            }else{
              var url = `${folderVideo}/${id}_${archivoObtenido.name}`;
              fs.writeFile(url, archivoObtenido.data, (errorWrite) => {
                if(errorWrite){
                  console.log("Error escritura de archivos", errorWrite);
                }else{
                  videos.pasar360(url, folderVideo, id, archivoObtenido.name, (resultado)=>{
                    res.send(resultado);
                  });
                }
              });
            }
          } catch (errrFodelID) {
            res.status(500).send(errorFolderB);
          }
        }
      });
    }else{
      const folderVideo = __dirname+"/archivos/videosProfesionales/video_"+id;
          try {
            if(!fs.existsSync(folderVideo)){
              fs.mkdir(folderVideo, function(error){
                if(error){
                  console.log(error);
                  res.send({
                    mensaje : "No se pudo crear la carpeta del id",
                    error : error
                  });
                }else{
                  var url = `${folderVideo}/${id}_${archivoObtenido.name}`;
                  fs.writeFile(url, archivoObtenido.data, (errorWrite) => {
                    if(errorWrite){
                      console.log("Error escritura de archivos", errorWrite);
                    }else{
                      videos.pasar360(url, folderVideo, id, archivoObtenido.name, (resultado)=>{
                        res.send(resultado);
                      });
                    }
                  });
                }
              });
            }else{
              var url = `${folderVideo}/${id}_${archivoObtenido.name}`;
              fs.writeFile(url, archivoObtenido.data, (errorWrite) => {
                if(errorWrite){
                  console.log("Error escritura de archivos", errorWrite);
                }else{
                  videos.pasar360(url, folderVideo, id, archivoObtenido.name, (resultado)=>{
                    res.send(resultado);
                  });
                }
              });
            }
          } catch (errrFodelID) {
            res.status(500).send(errorFolderB);
          }
    }
  }catch(errorFolderBase){
    res.status(500).send({mensaje : errorFolderBase});
  }
});

  //METODO PARA LA CREACION DEL EJERCICIO DE RUTINA
  /*
    los datos a obtener 
      id_profesional int not null, id_paciente int not null, cantidad char(20) not null, id_video int,
      id_ejercicio int not null, fechaInicio date not null, fechaFin date not null, vigencia char(1) not null,
      dentro del campo de vigencia colocar el valor de 1, debido a que se encuentra vigente el ejercicio, será 0 cuando ya no se encuentre
  */

app.post("/altaEjercicioRutina", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.id_profesional === "" || req.body.id_paciente === "" || req.body.cantidad === "" || req.body.id_video === "" || req.body.id_ejercicio === "" || req.body.fechaInicio === "" || req.body.fechaFin === "" || req.body.vigencia === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      //realizamos la carga de datos
      conn.query(`INSERT INTO ejercicio_rutina VALUES (0, ${req.body.id_profesional}, ${req.body.id_paciente}, '${req.body.cantidad}', ${req.body.id_video}, ${req.body.id_ejercicio}, '${req.body.fechaInicio}', '${req.body.fechaFin}', '${req.body.vigencia}')`, (errorInsert, resultInsert) => {
        if(errorInsert){
          res.status(500).send({mensaje : errorInsert.name, codigo : errorInsert.code});
          throw errorInsert;
        }else{
          res.status(200).send({mensaje : "Creacion de ejercicio de rutina"});
        }
      });
    }
  }
});

//METODOS DE OBTENCIÓN DE INFORMACIÓN

app.get("/obtenTipos", (req, res) => {
  //obtenemos la lista de los tipos que los profesionales de la salud pueden ser
  const conn = conexion.cone;
  conn.query("SELECT * FROM tipos_profesional", (err, result) => {
    if (err){
      res.send(err).status(500);
      throw err;
    } else {
      var objeto = {};
      var data = [];
      for (let i = 0; i < result.length; i++) {
        data.push({
          id: result[i].id_tipo,
          descripcion: result[i].descripcion,
        });
      }
      objeto.data = data;
      res.send(objeto).status(200);
    }
  });
});

app.get("/obtenProfesionales", (req, res) => {//obtención completa de los profesionales, retornando sus ID y nombre completo
  //obtenemos la lista de profesionales que se encuentren registrados dentro de la base de datos
  const conn = conexion.cone;
  conn.query( "select id_profesional, nombre, apPaterno, apMaterno from usuarios_profesionales", (err, result) => {
     if(err){
      res.send(err).status(500);
      throw err;
     }
     else{
      var objeto = {};
      var data = [];
      for (let i = 0; i < result.length; i++) {
        data.push({
          id: result[i].id_profesional,
          nombreC: result[i].nombre + " " + result[i].apPaterno + " " + result[i].apMaterno,
        });
      }
      objeto.data = data;
      res.send(objeto).status(200);
     }
    }
  );
});

app.get("/obtenTiposCitas", (req, res) => {
  const conn = conexion.cone;
  conn.query("SELECT * FROM tipoCitas", (err, result) => {
    if(err){
      res.send(err).status(500);
      throw err;
    }else{
      var objeto = {};
      var data = [];
      for (let i = 0; i < result.length; i++) {
        data.push({
          id: result[i].id_tipoCita,
          descripcion: result[i].descripcion,
        });
      }
      objeto.data = data;
      res.send(objeto).status(200);
    }
  });
});

app.get("/obtenCitasFechaHora", (req, res) => { //metodo que obtendra del body la fecha o hora a buscar
  /*
  PARA HACER USO DE ESTA PETICIÓN SE DEBE DE CONSIDERAR QUE EN EL BODY DE LA PETICIÓN SE TENDRÁN DOS CAMPOS:
    hora y fecha
  DEL CUAL EN LA FECHA, EN EL CASO DE QUE SE HAGA BUSQUEDA POR AÑO SE DEBE REALIZAR DE ESTA MANERA LA PETICIÓN:
      {
        "fecha" : "AÑO-"
      }
  ESTO PARA QUE EL MISMO MySQL PUEDA ENTENDER QUE PARTE BUSCAR, DE IGUAL MANERA PARA LOS MESES Y DIAS
        "fecha" : "-MES-"    "fecha" : "-DÍA-"
  Y PARA LA HORA ES SIMILIAR  
        "hora" : "HORA:"      "hora" : ":MINUTOS:"      "hora" : ":SEGUNDOS"
  */
  if(JSON.stringify(req.body) === "{}"){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error: "sin información"});
  }else{
    //comprobamos que existan alguno de los elementos
    if(req.body.fecha === "" && req.body.hora === ""){//caso donde se tienen los elementos pero no contienen datos
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos en ambos campos");
    }else{//al menos uno de los elementos se encuentra con información
      //select * from citas WHERE fecha_hora LIKE '%:%0:%';
      //`SELECT * FROM citas WHERE fecha_hora LIKE ('%${req.body.fecha}% %${req.body.hora}%')`
      const conn = conexion.cone;
      //obtenemos datos de la cita, el nombre del tipo de cita, del profesional y del paciente
      conn.query(`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE fecha_hora LIKE  ('%${req.body.fecha}% %${req.body.hora}%') and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente`, (error, result) => {
        if(error){
          res.send(error).status(500);
          throw error;
        }else{
          var objeto = {};
          var data = [];
          
          for(let i = 0; i < result.length; i++){
                        
            //hacemos la modificación de la hora
            let fecha = new Date(result[i].fecha_hora);
            //hacemos el formateo de la fecha y hora respectivamente
            let fechaANO = fecha.getUTCFullYear();
            let fechaMES = fecha.getUTCMonth() + 1;
            let fechaDIA = fecha.getUTCDate();
            //HORA
            let hora = fecha.getUTCHours()-6;//diferencia de lo que obtenemos respecto a lo que buscamos
            let minutos = fecha.getUTCMinutes();
            let segundos = fecha.getUTCSeconds();
            
            let fechaCompleta = ""+fechaDIA+"-"+fechaMES+"-"+fechaANO;
            let horaCompleta = ""+hora+":"+minutos+":"+segundos;

            //GENERAMOS LOS NOMBRES COMPLETOS DE LOS PACIENTES Y PROFESIONALES
            let nCpacientes = result[i].pacienteN + " " + result[i].pacienteAPp + " " + result[i].pacienteAPm;
            let nCprofesionales = result[i].profesionalN + " " + result[i].profesionalAPp + " " + result[i].profesionalAPm;
            //creamos el objeto de respuesta
            data.push({
              idTipoCita : result[i].id_tipoCita,
              tipoCita : result[i].descripcion,
              id_profesional : result[i].id_profesional,
              nombreProfesional : nCprofesionales,
              id_paciente : result[i].id_paciente,
              nombrePaciente : nCpacientes,
              fecha : fechaCompleta,
              hora : horaCompleta
            });
          }
          objeto.data = data;
          res.send(objeto).status(200);
        }
      });
    }
  }
});

app.get("/obtenProfesionalesPorValidar", (req, res) => { //metodo para obtener a los profesionales que hagan falta de validar dentro de la BD
  const conn = conexion.cone;
  conn.query(`SELECT id_profesional, nombre, apPaterno, apMaterno FROM usuarios_profesionales WHERE valido = '0'`, (err, result) => {
    if(err){
      res.status(500).send(err);
      throw err;
    }else{
      var objeto = {};
      var data = [];
      for(let i = 0; i < result.length; i++){
        data.push({
          id : result[i].id_profesional,
          nombreC : result[i].nombre + " " + result[i].apPaterno + " " + result[i].apMaterno
        });
      }
      objeto.data = data;
      res.status(200).send(objeto);
    }
  });
});

app.get("/obtenProfesionalesValidados", (req, res) => { //metodo para obtener a los profesionales que se encuentran validados
  const conn = conexion.cone;
  conn.query(`SELECT id_profesional, nombre, apPaterno, apMaterno FROM usuarios_profesionales WHERE valido = '1'`, (err, result) => {
    if(err){
      res.status(500).send(err);
      throw err;
    }else{
      var objeto = {};
      var data = [];
      for(let i = 0; i < result.length; i++){
        data.push({
          id : result[i].id_profesional,
          nombreC : result[i].nombre + " " + result[i].apPaterno + " " + result[i].apMaterno
        });
      }
      objeto.data = data;
      res.status(200).send(objeto);
    }
  });
});

    //AGREGAR PARAMETROS PARA OBTENER EL STATUS DE LA CITA MEDIANTE LA FECHA

app.get("/obtenCitasProfesional", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error: "sin información"});
  }else{
    //comprobamos que exista el elemento del ID a buscar
    if(req.body.id === ""){
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos");
    }else{
      const conn = conexion.cone;
      var objeto = {};
      var data = [];
      console.log(req.body);
      //obtenemos datos de la cita, el nombre del tipo de cita, del paciente
      //`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE id_profesional = ${req.body.id_profesional} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente` 
      conn.query(`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_profesional = ${req.body.id} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = ${req.body.id} and pa.id_paciente = c.id_paciente`, (error, result) => {
        for(let i = 0; i < result.length; i++){
           //hacemos la modificación de la hora
           let fecha = new Date(result[i].fecha_hora);
           //hacemos el formateo de la fecha y hora respectivamente
           let fechaANO = fecha.getUTCFullYear();
           let fechaMES = fecha.getUTCMonth() + 1;
           let fechaDIA = fecha.getUTCDate();
           //HORA
           let hora = fecha.getUTCHours()-6;//diferencia de lo que obtenemos respecto a lo que buscamos
           let minutos = fecha.getUTCMinutes();
           let segundos = fecha.getUTCSeconds();
           
           let fechaCompleta = ""+fechaDIA+"-"+fechaMES+"-"+fechaANO;
           let horaCompleta = ""+hora+":"+minutos+":"+segundos;

           //GENERAMOS LOS NOMBRES COMPLETOS DE LOS PACIENTES Y PROFESIONALES
           let nCpacientes = result[i].pacienteN + " " + result[i].pacienteAPp + " " + result[i].pacienteAPm;
           let nCprofesionales = result[i].profesionalN + " " + result[i].profesionalAPp + " " + result[i].profesionalAPm;
           //creamos el objeto de respuesta
           data.push({
             idTipoCita : result[i].id_tipoCita,
             tipoCita : result[i].descripcion,
             id_profesional : result[i].id_profesional,
             nombreProfesional : nCprofesionales,
             id_paciente : result[i].id_paciente,
             nombrePaciente : nCpacientes,
             fecha : fechaCompleta,
             hora : horaCompleta
           });
        }
        objeto.data = data;
        res.send(objeto).status(200);
      });
    }
  }
});

app.get("/obtenCitasPaciente", (req, res) => {
  if(JSON.stringify(req.body) === "{}"){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error: "sin información"});
  }else{
    if(req.body.id === ""){
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos");
    }else{
      const conn = conexion.cone;
      var objeto = {};
      var data = [];
      console.log(req.body);
      conn.query(`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_paciente = ${req.body.id} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = ${req.body.id}`, (error, result) => {
        for(let i = 0; i < result.length; i++){
           //hacemos la modificación de la hora
           let fecha = new Date(result[i].fecha_hora);
           //hacemos el formateo de la fecha y hora respectivamente
           let fechaANO = fecha.getUTCFullYear();
           let fechaMES = fecha.getUTCMonth() + 1;
           let fechaDIA = fecha.getUTCDate();
           //HORA
           let hora = fecha.getUTCHours()-6;//diferencia de lo que obtenemos respecto a lo que buscamos
           let minutos = fecha.getUTCMinutes();
           let segundos = fecha.getUTCSeconds();
           
           let fechaCompleta = ""+fechaDIA+"-"+fechaMES+"-"+fechaANO;
           let horaCompleta = ""+hora+":"+minutos+":"+segundos;

           //GENERAMOS LOS NOMBRES COMPLETOS DE LOS PACIENTES Y PROFESIONALES
           let nCpacientes = result[i].pacienteN + " " + result[i].pacienteAPp + " " + result[i].pacienteAPm;
           let nCprofesionales = result[i].profesionalN + " " + result[i].profesionalAPp + " " + result[i].profesionalAPm;
           //creamos el objeto de respuesta
           data.push({
             idTipoCita : result[i].id_tipoCita,
             tipoCita : result[i].descripcion,
             id_profesional : result[i].id_profesional,
             nombreProfesional : nCprofesionales,
             id_paciente : result[i].id_paciente,
             nombrePaciente : nCpacientes,
             fecha : fechaCompleta,
             hora : horaCompleta
           });
        }
        objeto.data = data;
        res.send(objeto).status(200);
      });
    }
  }
});

  //OBTENCIÓN DE PROXIMAS CITAS SIMILAR A LOS MÉTODOS PASADOS

app.get("/obtenProximasCitas", (req, res) => { //método que obtendrá del body la fecha o hora a buscar
    //misma forma que en obtenCitasFechaHora
    if(JSON.stringify(req.body) === "{}"){
      console.log("Error, no hay datos para la busqueda");
      res.status(500).send({error: "sin información"});
    }else{
      //comprobamos que existan alguno de los elementos
      if(req.body.fecha === "" && req.body.hora === ""){
        console.log("Error no hay datos completos");
        res.status(500).send("Error, no hay datos en ambos campos");
      }else{
        const conn = conexion.cone;
        conn.query(`SELECT c.id_profesional, c.id_paciente, c.fecha_hora, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM proximas_citas AS c, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE fecha_hora LIKE  ('%${req.body.fecha}% %${req.body.hora}%') and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente`, (error, result) => {
          if(error){
            res.send(error).status(500);
            throw error;
          }else{
            var objeto = {};
            var data = [];
            
            for(let i = 0; i < result.length; i++){
                          
              //hacemos la modificación de la hora
              let fecha = new Date(result[i].fecha_hora);
              //hacemos el formateo de la fecha y hora respectivamente
              let fechaANO = fecha.getUTCFullYear();
              let fechaMES = fecha.getUTCMonth() + 1;
              let fechaDIA = fecha.getUTCDate();
              //HORA
              let hora = fecha.getUTCHours()-6;//diferencia de lo que obtenemos respecto a lo que buscamos
              let minutos = fecha.getUTCMinutes();
              let segundos = fecha.getUTCSeconds();
              
              let fechaCompleta = ""+fechaDIA+"-"+fechaMES+"-"+fechaANO;
              let horaCompleta = ""+hora+":"+minutos+":"+segundos;
  
              //GENERAMOS LOS NOMBRES COMPLETOS DE LOS PACIENTES Y PROFESIONALES
              let nCpacientes = result[i].pacienteN + " " + result[i].pacienteAPp + " " + result[i].pacienteAPm;
              let nCprofesionales = result[i].profesionalN + " " + result[i].profesionalAPp + " " + result[i].profesionalAPm;
              //creamos el objeto de respuesta
              data.push({
                id_profesional : result[i].id_profesional,
                nombreProfesional : nCprofesionales,
                id_paciente : result[i].id_paciente,
                nombrePaciente : nCpacientes,
                fecha : fechaCompleta,
                hora : horaCompleta
              });
            }
            objeto.data = data;
            res.send(objeto).status(200);
          }
        });
      }
    }
  });

  //AGREGAR PARAMETROS PARA OBTENER EL STATUS DE LA CITA MEDIANTE LA FECHA

app.get("/obtenProximasCitasProfesional", (req, res) => {
    if(JSON.stringify(req.body) === '{}'){
      console.log("Error, no hay datos para la busqueda");
      res.status(500).send({error: "sin información"});
    }else{
      //comprobamos que exista el elemento del ID a buscar
      if(req.body.id === ""){
        console.log("Error no hay datos completos");
        res.status(500).send("Error, no hay datos");
      }else{
        const conn = conexion.cone;
        var objeto = {};
        var data = [];
        console.log(req.body);
        //obtenemos datos de la cita, el nombre del tipo de cita, del paciente
        //`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE id_profesional = ${req.body.id_profesional} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente` 
        conn.query(`SELECT c.id_profesional, c.id_paciente, c.fecha_hora, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM proximas_citas AS c, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_profesional = ${req.body.id} and p.id_profesional = ${req.body.id} and pa.id_paciente = c.id_paciente`, (error, result) => {
          for(let i = 0; i < result.length; i++){
             //hacemos la modificación de la hora
             let fecha = new Date(result[i].fecha_hora);
             //hacemos el formateo de la fecha y hora respectivamente
             let fechaANO = fecha.getUTCFullYear();
             let fechaMES = fecha.getUTCMonth() + 1;
             let fechaDIA = fecha.getUTCDate();
             //HORA
             let hora = fecha.getUTCHours()-6;//diferencia de lo que obtenemos respecto a lo que buscamos
             let minutos = fecha.getUTCMinutes();
             let segundos = fecha.getUTCSeconds();
             
             let fechaCompleta = ""+fechaDIA+"-"+fechaMES+"-"+fechaANO;
             let horaCompleta = ""+hora+":"+minutos+":"+segundos;
  
             //GENERAMOS LOS NOMBRES COMPLETOS DE LOS PACIENTES Y PROFESIONALES
             let nCpacientes = result[i].pacienteN + " " + result[i].pacienteAPp + " " + result[i].pacienteAPm;
             let nCprofesionales = result[i].profesionalN + " " + result[i].profesionalAPp + " " + result[i].profesionalAPm;
             //creamos el objeto de respuesta
             data.push({
               id_profesional : result[i].id_profesional,
               nombreProfesional : nCprofesionales,
               id_paciente : result[i].id_paciente,
               nombrePaciente : nCpacientes,
               fecha : fechaCompleta,
               hora : horaCompleta
             });
          }
          objeto.data = data;
          res.send(objeto).status(200);
        });
      }
    }
  });

app.get("/obtenProximasCitasPaciente", (req, res) =>{
  if(JSON.stringify(req.body) === "{}"){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error: "sin información"});
  }else{
    if(req.body.id === ""){
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos");
    }else{
      const conn = conexion.cone;
      var objeto = {};
      var data = [];
      console.log(req.body);
      conn.query(`SELECT c.id_profesional, c.id_paciente, c.fecha_hora, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM proximas_citas AS c, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_paciente = ${req.body.id} and p.id_profesional = c.id_profesional and pa.id_paciente = ${req.body.id}`, (error, result) => {
        for(let i = 0; i < result.length; i++){
           //hacemos la modificación de la hora
           let fecha = new Date(result[i].fecha_hora);
           //hacemos el formateo de la fecha y hora respectivamente
           let fechaANO = fecha.getUTCFullYear();
           let fechaMES = fecha.getUTCMonth() + 1;
           let fechaDIA = fecha.getUTCDate();
           //HORA
           let hora = fecha.getUTCHours()-6;//diferencia de lo que obtenemos respecto a lo que buscamos
           let minutos = fecha.getUTCMinutes();
           let segundos = fecha.getUTCSeconds();
           
           let fechaCompleta = ""+fechaDIA+"-"+fechaMES+"-"+fechaANO;
           let horaCompleta = ""+hora+":"+minutos+":"+segundos;

           //GENERAMOS LOS NOMBRES COMPLETOS DE LOS PACIENTES Y PROFESIONALES
           let nCpacientes = result[i].pacienteN + " " + result[i].pacienteAPp + " " + result[i].pacienteAPm;
           let nCprofesionales = result[i].profesionalN + " " + result[i].profesionalAPp + " " + result[i].profesionalAPm;
           //creamos el objeto de respuesta
           data.push({
             id_profesional : result[i].id_profesional,
             nombreProfesional : nCprofesionales,
             id_paciente : result[i].id_paciente,
             nombrePaciente : nCpacientes,
             fecha : fechaCompleta,
             hora : horaCompleta
           });
        }
        objeto.data = data;
        res.send(objeto).status(200);
      });
    }
  }
});

app.get("/obtenCatalogoEnfermedades", (req, res) => {
  const conn = conexion.cone;
  conn.query("SELECT * FROM c_enfermedades", (err, result) => {
    if(err){
      res.send(err).status(500);
      throw err;
    } else {
      var objeto = {}, data = [];
      for(let i = 0; i < result.length; i++){
        data.push({
          id : result[i].id_enfermedad,
          descripcion : result[i].descripcion
        });
      }
      objeto.data = data;
      res.send(objeto).status(200);
    }
  });
});

app.get("/obtenMusculos", (req, res) => {
  const conn = conexion.cone;
  conn.query("SELECT * FROM musculos", (err, result) => {
    if(err){
      res.send(err).status(500);
      throw err;
    }else{
      var objeto = {}, data = [];
      for(let i = 0; i < result.length; i++){
        data.push({
          id : result[i].id_musculos,
          descripcion : result[i].nombre_musculo
        });
      }
      objeto.data = data;
      res.send(objeto).status(200);
    }
  });
});

app.get("/obtenTipoComida", (req, res) => {
  const conn = conexion.cone;
  conn.query("SELECT * FROM tipoComida", (err, result) => {
    if(err){
      res.send(err).status(500);
      throw err;
    }else{
      var objeto = {}, data = [];
      for(let i = 0; i < result.length; i++){
        data.push({
          id : result[i].id_comida,
          descripcion : result[i].descripcion
        });
      }
      objeto.data = data;
      res.status(300).send(objeto);
    }
  });
});

  //METODO PARA OBTENER LA IMAGEN DEL PROFESIONAL DENTRO DE LA BD
app.get("/obtenImgProfesional", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error : "sin informacion"});
  }else{
    if(req.body.id === ""){
      console.log("Error no hay datos");
      res.send(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM imgUsuariosProfesionales WHERE id_profesional = ${req.body.id}`, (err, result) =>{
        if(err){
          res.status(500).send({error : err});
          throw err;
        }else{
          const nombreFolderPadre = "./archivos/imgProfesionales";
          try{
            if(!fs.existsSync(nombreFolderPadre)){
              fs.mkdir(nombreFolderPadre, function(errorFolderB){
                if(errorFolderB){
                  console.log(errorFolderB);
                  res.send({
                    mensaje : "No se pudo crear la carpeta",
                    error : errorFolderB
                  });
                }else{
                  const nombreFolder = "./archivos/imgProfesionales/id_"+req.body.id;
                  try{
                    if(!fs.existsSync(nombreFolder)){
                      fs.mkdir(nombreFolder, function(error){
                        if(error){
                          console.log(error);
                          res.send({mensaje: "No se pudo crear la carpeta",
                                    error : error});
                        }else{
                          var url = `${nombreFolder}/${req.body.id}_img.`+result[0].extension;
                          fs.writeFile(url, result[0].img, (err) => {
                            if(err){
                              console.log("Error escritura de archivos decodificado", err);
                              }else{
                                //intentamos hacer el envio de la img
                                var stat = fs.statSync(`./archivos/imgProfesionales/id_${req.body.id}_img.${result[0].extension}`);
                                res.writeHead(200, {
                                  'Content-Type' : `image/${result[0].extension}`,
                                  'Content-Length' : stat.size
                                });
                                var lectura = fs.createReadStream(url);
                                lectura.pipe(res);
                              }
                          });
                        }
                      });
                    }else{
                      var url = `${nombreFolder}/${req.body.id}_img.`+result[0].extension;
                      fs.writeFile(url, result[0].img, (err) => {
                        if(err){
                          console.log("Error escritura de archivos decodificado", err);
                          }else{
                            //intentamos hacer el envio de la img
                            var stat = fs.statSync(url);
                            res.writeHead(200, {
                              'Content-Type' : `image/${result[0].extension}`,
                              'Content-Length' : stat.size
                            });
                            var lectura = fs.createReadStream(url);
                            lectura.pipe(res);
                          }
                      });
                      
                    }
                  }catch(err){
                    res.status(500).send(err);
                  }
                }
              });
            }else{
              const nombreFolder = "./archivos/imgProfesionales/id_"+req.body.id;
              try{
                if(!fs.existsSync(nombreFolder)){
                  fs.mkdir(nombreFolder, function(error){
                    if(error){
                      console.log(error);
                      res.send({mensaje: "No se pudo crear la carpeta",
                                error : error});
                    }else{
                      var url = `${nombreFolder}/${req.body.id}_img.`+result[0].extension;
                      fs.writeFile(url, result[0].img, (err) => {
                        if(err){
                          console.log("Error escritura de archivos decodificado", err);
                          }else{
                            //intentamos hacer el envio de la img
                            var stat = fs.statSync(url);
                            res.writeHead(200, {
                              'Content-Type' : `image/${result[0].extension}`,
                              'Content-Length' : stat.size
                            });
                            var lectura = fs.createReadStream(url);
                            lectura.pipe(res);
                          }
                      });
                      
                    }
                  });
                }else{
                  var url = `${nombreFolder}/${req.body.id}_img.`+result[0].extension;
                  fs.writeFile(url, result[0].img, (err) => {
                    if(err){
                      console.log("Error escritura de archivos decodificado", err);
                      }else{
                        //intentamos hacer el envio de la img
                        var stat = fs.statSync(url);
                        res.writeHead(200, {
                          'Content-Type' : `image/${result[0].extension}`,
                          'Content-Length' : stat.size
                        });
                        var lectura = fs.createReadStream(url);
                        lectura.pipe(res);
                      }
                  });
                }
              }catch(err){
                res.status(500).send(err);
              }
            }
          }catch(errorFolderBase){
            res.status(500).send(errorFolderBase);
          }
          
        }
      });
    }
  }
});

  //METODO PARA OBTENER LA IMAGEN DEL PACIENTE DENTRO DE LA ID
app.get("/obtenImgPaciente", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error : "sin informacion"});
  }else{
    if(req.body.id === ""){
      console.log("Error no hay datos");
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM imgUsuariosPacientes WHERE id_paciente = ${req.body.id}`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          res.status(500).send({error : errorBusqueda});
          throw errorBusqueda;
        }else{
          const nombreFolderPadre = __dirname+"/archivos/imgPacientes";
          try{
            if(!fs.existsSync(nombreFolderPadre)){
              fs.mkdir(nombreFolderPadre, function(errorFolderB){
                if(errorFolderB){
                  console.log(errorFolderB);
                  res.send({
                    mensaje : "Ni se pudo crear la carpeta",
                    error : errorFolderB
                  });
                }else{
                 const nombreFolder = __dirname+"/archivos/imgPacientes/id_" +req.body.id;
                 try{
                  if(!fs.existsSync(nombreFolder)){
                    fs.mkdir(nombreFolder, function(error){
                      if(error){
                        console.log(error);
                        res.send({mensaje : "No se pudo crear la carpeta base",
                                  error : error});
                      }else{
                        var url = `${nombreFolder}/${req.body.id}_img.`+resultBusqueda[0].extension;
                        fs.writeFile(url, resultBusqueda[0].img, (err) => {
                          if(err){
                            console.log("Error escritura de archivos decodificado", err);
                          }else{
                            //intentamos hacer el envio de la img
                            var stat = fs.statSync(`${__dirname}/archivos/imgPacientes/id_${req.body.id}/${req.body.id}_img.${resultBusqueda[0].extension}`);
                            res.writeHead(200, {
                              'Content-Type' : `image/${resultBusqueda[0].extension}`,
                              'Content-Length' : stat.size
                            });
                            var lectura = fs.createReadStream(url);
                            lectura.pipe(res);
                          }
                        });
                      }
                    });
                  }else{
                    var url = `${nombreFolder}/${req.body.id}_img.`+resultBusqueda[0].extension;
                    fs.writeFile(url, resultBusqueda[0].img, (err) => {
                      if(err){
                        console.log("Error escritura de archivos decodificado", err);
                      }else{
                        //intentamos hacer el envio de la img
                        var stat = fs.statSync(`${__dirname}/archivos/imgPacientes/id_${req.body.id}/${req.body.id}_img.${resultBusqueda[0].extension}`);
                        res.writeHead(200, {
                          'Content-Type' : `image/${resultBusqueda[0].extension}`,
                          'Content-Length' : stat.size
                        });
                        var lectura = fs.createReadStream(url);
                        lectura.pipe(res);
                      }
                    });
                  }
                 }catch(errorFolderB){
                  res.status(500).send(errorFolderB);
                 }
                }
              });
            }else{
              const nombreFolder = __dirname+"/archivos/imgPacientes/id_" +req.body.id;
                 try{
                  if(!fs.existsSync(nombreFolder)){
                    fs.mkdir(nombreFolder, function(error){
                      if(error){
                        console.log(error);
                        res.send({mensaje : "No se pudo crear la carpeta base",
                                  error : error});
                      }else{
                        var url = `${nombreFolder}/${req.body.id}_img.`+resultBusqueda[0].extension;
                        fs.writeFile(url, resultBusqueda[0].img, (err) => {
                          if(err){
                            console.log("Error escritura de archivos decodificado", err);
                          }else{
                            //intentamos hacer el envio de la img
                            var stat = fs.statSync(`${__dirname}/archivos/imgPacientes/id_${req.body.id}/${req.body.id}_img.${resultBusqueda[0].extension}`);
                            res.writeHead(200, {
                              'Content-Type' : `image/${resultBusqueda[0].extension}`,
                              'Content-Length' : stat.size
                            });
                            var lectura = fs.createReadStream(url);
                            lectura.pipe(res);
                          }
                        });
                      }
                    });
                  }else{
                    var url = `${nombreFolder}/${req.body.id}_img.`+resultBusqueda[0].extension;
                    fs.writeFile(url, resultBusqueda[0].img, (err) => {
                      if(err){
                        console.log("Error escritura de archivos decodificado", err);
                      }else{
                        //intentamos hacer el envio de la img
                        var stat = fs.statSync(`${__dirname}/archivos/imgPacientes/id_${req.body.id}/${req.body.id}_img.${resultBusqueda[0].extension}`);
                        res.writeHead(200, {
                          'Content-Type' : `image/${resultBusqueda[0].extension}`,
                          'Content-Length' : stat.size
                        });
                        var lectura = fs.createReadStream(url);
                        lectura.pipe(res);
                      }
                    });
                  }
                 }catch(errorFolderB){
                  res.status(500).send(errorFolderB);
                 }
            }
          }catch(errorFP){
            res.status(500).send(errorFP);
          }
        }
      });
    }
  }
});

  //METODO PARA OBTENER LOS VIDEOS DE LOS PROFESIONALES DE LA SALUD MEDIANTE EL ID DE USUARIO
app.get("/obtenVideosProfesional", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({error : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM videos WHERE id_profesional = ${req.body.id}`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          res.status(500).send({error : errorBusqueda});
          throw errorBusqueda;
        }else{
          const nombreFolderPadre = __dirname+"/archivos/videosProfesionales";
          try {
            if(!fs.existsSync(nombreFolderPadre)){
              fs.mkdir(nombreFolderPadre, function (errorFolderP){
                if(errorFolderP){
                  res.send({
                    mensaje : "No se pudo crear la carpeta",
                    error : errorFolderP
                  });
                }else{
                  const nombreFolder = __dirname+"/archivos/videosProfesionales/video_"+req.body.id;
                  try {
                    if(!fs.existsSync(nombreFolder)){
                      fs.mkdir(nombreFolder, function(err){
                        if(err){
                          res.send({mensaje : "No se pudo crear la carpeta", error : err});
                        }else{
                          var objeto = {}, data = [];
                          for(let i = 0; i < resultBusqueda.length; i++){
                            fs.writeFile(`${nombreFolder}/${resultBusqueda[i].nombreVideo}`, resultBusqueda[i].video, async (errorCreacion) => {
                              if(errorCreacion){
                                console.log("Error escritura de archivos");
                              }
                            });
                            data.push({
                              nombre : resultBusqueda[i].nombreVideo,
                              data : resultBusqueda[i].video
                            });
                          }
                          objeto.data = data;
                          res.set({
                            'Content-Type' : "application/json",
                            'Content-Length' : ""+data[0].length * 2
                          });
                          //res.setHeader('Content-Length', ""+data[0].length * 2);
                          res.status(200).send(objeto);
                          /*
                          res.status(200).send({
                            mensaje : "Obtencion de los archivos",
                            archivos : objeto});
                            */
                        }
                      });
                    }else{
                      var objeto = {}, data = [];
                      for(let i = 0; i < resultBusqueda.length; i++){
                        fs.writeFile(`${nombreFolder}/${resultBusqueda[i].nombreVideo}`, resultBusqueda[i].video, async (errorCreacion) => {
                          if(errorCreacion){
                            console.log("Error escritura de archivos");
                          }
                        });
                        data.push({
                          nombre : resultBusqueda[i].nombreVideo,
                          data : resultBusqueda[i].video
                        });
                      }
                      objeto.data = data;
                      res.set({
                        'Content-Type' : "application/json",
                        'Content-Length' : ""+data[0].length * 2
                      });
                      //res.setHeader('Content-Length', ""+data[0].length * 2);
                      res.status(200).send(objeto);
                    }
                  } catch (errorNombreF) {
                    res.status(500).send(errorNombreF);
                  }
                }
              });
            }else{
              const nombreFolder = __dirname+"/archivos/videosProfesionales/video_"+req.body.id;
              try {
                if(!fs.existsSync(nombreFolder)){
                  fs.mkdir(nombreFolder, function(err){
                    if(err){
                      res.send({mensaje : "No se pudo crear la carpeta", error : err});
                    }else{
                      var objeto = {}, data = [];
                      for(let i = 0; i < resultBusqueda.length; i++){
                        fs.writeFile(`${nombreFolder}/${resultBusqueda[i].nombreVideo}`, resultBusqueda[i].video, async (errorCreacion) => {
                          if(errorCreacion){
                            console.log("Error escritura de archivos");
                          }
                        });
                        data.push({
                          nombre : resultBusqueda[i].nombreVideo,
                          data : resultBusqueda[i].video
                        });
                      }
                      objeto.data = data;
                      res.set({
                        'Content-Type' : "application/json",
                        'Content-Length' : ""+data[0].length * 2
                      });
                      //res.setHeader('Content-Length', ""+data[0].length * 2);
                      res.status(200).send(objeto);
                    }
                  });
                }else{
                  var objeto = {}, data = [];
                  for(let i = 0; i < resultBusqueda.length; i++){
                    fs.writeFile(`${nombreFolder}/${resultBusqueda[i].nombreVideo}`, resultBusqueda[i].video, async (errorCreacion) => {
                      if(errorCreacion){
                        console.log("Error escritura de archivos");
                      }
                    });
                    data.push({
                      nombre : resultBusqueda[i].nombreVideo,
                      data : resultBusqueda[i].video
                    });
                  }
                  objeto.data = data;
                  res.set({
                    'Content-Type' : "application/json",
                    'Content-Length' : ""+data[0].length * 2
                  });
                  //res.setHeader('Content-Length', ""+data[0].length * 2);
                  res.status(200).send(objeto);
                }
              } catch (errorNombreF) {
                res.status(500).send(errorNombreF);
              }
            }
          } catch (errorFolderPadre) {
            res.status(500).send({
                mensaje: "Error al crear la carpeta padre",
                error: errorFolderPadre,
              });
            throw errorFolderPadre;
          }
        }
      });
    }
  }
});

  //METODO PARA OBTENER EL LISTADO DE NOMBRE DE LOS VIDEOS POR PROFESIONAL DE LA SALUD, ESTE SERVIRA PARA LA CREACIÓN DE RUTINAS
app.get("/obtenListaVideoProfesional", (req, res) => {//OBTENEMOS EL ID DEL PROFESIONAL Y RETORNA EL LISTADO ASOCIADO DE VIDEOS DE ESTE PROFESIONAL
  if(JSON.stringify(req.body) === '{}'){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error : "sin informacion"});
  }else{
    if(req.body.id === ""){
      console.log("Error no hay datos");
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT id_video, nombreVideo FROM videos WHERE id_profesional = ${req.body.id}`, (errorBusqueda, resultadoBusqueda) => {
        if(errorBusqueda){
          res.status(500).send({error : errorBusqueda});
          throw errorBusqueda;
        }else{
          var objeto = {}, data = [];
          for(let i = 0; i < resultadoBusqueda.length; i++){
            data.push({
              id_video : resultadoBusqueda[i].id_video,
              nombre : resultadoBusqueda[i].nombreVideo,
              id_profesional : req.body.id
            });
          }
          objeto.data = data;
          res.status(200).send(objeto);
        }
      });
    }
  }
});

  //METODO PARA OBTENER LA INFORMACION NECESARIA PARA CREAR EL EJERCICIO DE UNA RUTINA
    //EN ESTE METODO OBTENEMOS EL ID DEL PROFESIONAL PARA HACER LA OBTENCION DE LA INFO NECESARIA
app.get("/obtenInfoCreaRutina", (req, res) => {//se retorna la lista de pacientes, lista de ejercicios con sus musculos y la lista de videos que el profesional tiene cargados
  if(JSON.stringify(req.body) === '{}'){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      console.log("Error no hay datos completos");
      res.status(500).send({error : "Error no hay datos"});
    }else{
      const conn = conexion.cone;
      var objeto = {}, usuarios = [], ejercicios = [], musculos = [], videos = [];
      //var query = `SELECT usPac.id_paciente, usPac.nombre, usPac.apPaterno, usPac.apMaterno, ejer.id_ejercicio, ejer.id_musculo, mu.nombre_musculo, vid.id_video, vid.nombreVideo FROM usuarios_pacientes AS usPac, ejercicios AS ejer, musculos AS mu, videos AS vid WHERE  usPac.id_profesional = ${req.body.id} AND vid.id_profesional = ${req.body.id} AND ejer.id_musculo = mu.id_musculos`;
        //primero obtenemos los datos de sus pacientes
      conn.query(`SELECT id_paciente, nombre, apPaterno, apMaterno FROM usuarios_pacientes WHERE id_profesional = ${req.body.id}`, (errorBusquedaUsuario, resultBusquedaUsuario) => {
        if(errorBusquedaUsuario){
          res.status(500).send({mensaje : errorBusquedaUsuario});
        }else{
          for(let i = 0; i < resultBusquedaUsuario.length; i++){
            usuarios.push({
              id : resultBusquedaUsuario[i].id_paciente,
              nombre : resultBusquedaUsuario[i].nombre + " " + resultBusquedaUsuario[i].apPaterno + " " + resultBusquedaUsuario[i].apMaterno
            });
          }
          objeto.pacientes = usuarios;
          //ahora obtenemos los datos de los ejercicios
          conn.query(`SELECT id_ejercicio, descripcion FROM ejercicios`, (errorBusquedaEjercicios, resultBusquedaEjercicios) => {
            if(errorBusquedaEjercicios){
              res.status(500).send({mensaje : errorBusquedaEjercicios});
            }else{
              for(let i = 0; i < resultBusquedaEjercicios.length; i++){
                ejercicios.push({
                  id : resultBusquedaEjercicios[i].id_ejercicio,
                  descipcion : resultBusquedaEjercicios[i].descripcion
                });
              }
              objeto.ejercicios = ejercicios;
              //obtenemos los datos de los musculos
              conn.query(`SELECT * FROM musculos`, (errorBusquedaMusculos, resultBusquedaMusculos) => {
                if(errorBusquedaMusculos){
                  res.status(500).send({mensaje : errorBusquedaMusculos});
                }else{
                  for(let i = 0; i < resultBusquedaMusculos.length; i++){
                    musculos.push({
                      id : resultBusquedaMusculos[i].id_musculos,
                      nombre : resultBusquedaMusculos[i].nombre_musculo
                    });
                  }
                  objeto.musculos = musculos;//metodo de obtener los datos : objeto.musculos[0].id
                  //obtenemos los datos de los videos 
                  conn.query(`SELECT id_video, nombreVideo from videos WHERE id_profesional = ${req.body.id}`, (errorBusquedaVideos, resultBusquedaVideos) => {
                    if(errorBusquedaVideos){
                      res.status(500).send({mensaje : errorBusquedaVideos});
                    }else{
                      for(let i = 0; i < resultBusquedaVideos.length; i++){
                        videos.push({
                          id : resultBusquedaVideos[i].id_video,
                          nombre : resultBusquedaVideos[i].nombreVideo
                        });
                      }
                      objeto.video = videos;
                    }
                    //console.log(objeto);
                    res.status(200).send({mensaje : objeto});
                  });
                }
              });
            }
          });
        }
      });
    }
  }
});

  //METODO PARA OBTENER EL VIDEO MEDIANTE UN ID DEL MISMO DADA UNA PREVIA OBTENCIÓN DEL MISMO
    //EN ESTE METODO OBTENEMOS EL ID DEL VIDEO A BUSCAR Y RETORNAMOS EL VIDEO
    //Al recibir la respuesta de la request, hacer la eliminación de los archivos
    //DENTRO DEL STATUS MESSAGE SE TIENE EL NOMBRE DEL VIDEO, CON LA FINALIDAD DE ALMACENARLO CON EL NOMBRE QUE CORRESPONDE
app.get("/obtenVideoPorId", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM videos WHERE id_video = ${req.body.id}`, (errorBusquedaVideo, resultadoBusquedaVideo) => {
        if(errorBusquedaVideo){
          res.status(500).send({mensaje : errorBusquedaVideo.message, codigo : errorBusquedaVideo.code});
        }else{
          const nombreFolderPadre = __dirname+"/archivos/videosProfesionales";
          try {
            //comprobación de que exista los directorios necesarios
            if(!fs.existsSync(nombreFolderPadre)){
              fs.mkdir(nombreFolderPadre, function(errorFolderP){
                if(errorFolderP){
                  res.send({mensaje : "No se pudo crear la carpeta: "+nombreFolderPadre, error : errorFolderP});
                }else{
                  const nombreFolder = __dirname+"/archivos/videosProfesionales/video_"+resultadoBusquedaVideo[0].id_profesional;
                  try {
                    if(!fs.existsSync(nombreFolder)){
                      fs.mkdir(nombreFolder, function(errorNF){
                        if(errorNF){
                          res.send({mensaje : "No se pudo crear la carpeta: "+nombreFolder, error : errorNF});
                        }else{
                          var url = `${nombreFolder}/${resultadoBusquedaVideo[0].nombreVideo}`;
                          fs.writeFile(url, resultadoBusquedaVideo[0].video, (err) => {
                            if(err){
                              res.send({mensaje : "Error de escrutira del archivo de video"});
                            }else{
                              //realizamos el envio del video
                              var stat = fs.statSync(url);
                              res.writeHead(200, {
                                'Content-Type' : 'video/mp4',
                                'Content-Length' : stat.size
                              });
                              var lectura = fs.createReadStream(url);
                              lectura.pipe(res);
                            }
                          });
                        }
                      });
                    }else{
                      var url = `${nombreFolder}/${resultadoBusquedaVideo[0].nombreVideo}`;
                      fs.writeFile(url, resultadoBusquedaVideo[0].video, (err) => {
                        if(err){
                          res.send({mensaje : "Error de escrutira del archivo de video"});
                        }else{
                          //realizamos el envio del video
                          var stat = fs.statSync(url);
                          res.writeHead(200, {
                            'Content-Type' : 'video/mp4',
                            'Content-Length' : stat.size
                          });
                          var lectura = fs.createReadStream(url);
                          lectura.pipe(res);
                        }
                      });
                    }
                  } catch (errorFolderB) {
                    res.status(500).send({mensaje : errorFolderB})
                  }
                }
              });
            }else{
              const nombreFolder = __dirname+"/archivos/videosProfesionales/video_"+resultadoBusquedaVideo[0].id_profesional;
              try {
                if(!fs.existsSync(nombreFolder)){
                  fs.mkdir(nombreFolder, function(errorNF){
                    if(errorNF){
                      res.send({mensaje : "No se pudo crear la carpeta: "+nombreFolder, error : errorNF});
                    }else{
                      var url = `${nombreFolder}/${resultadoBusquedaVideo[0].nombreVideo}`;
                      fs.writeFile(url, resultadoBusquedaVideo[0].video, (err) => {
                        if(err){
                          res.send({mensaje : "Error de escrutira del archivo de video"});
                        }else{
                          //realizamos el envio del video
                          var stat = fs.statSync(url);
                          res.writeHead(200, {
                            'Content-Type' : 'video/mp4',
                            'Content-Length' : stat.size
                          });
                          var lectura = fs.createReadStream(url);
                          lectura.pipe(res);
                        }
                      });
                    }
                  });
                }else{
                  var url = `${nombreFolder}/${resultadoBusquedaVideo[0].nombreVideo}`;
                  fs.writeFile(url, resultadoBusquedaVideo[0].video, (err) => {
                    if(err){
                      res.send({mensaje : "Error de escrutira del archivo de video"});
                    }else{
                      //realizamos el envio del video
                      var stat = fs.statSync(url);
                      res.writeHead(200, resultadoBusquedaVideo[0].nombreVideo, 
                        {
                        'Content-Type' : 'video/mp4',
                        'Content-Length' : stat.size
                      });
                      //res.write(resultadoBusquedaVideo[0].nombreVideo);
                      var lectura = fs.createReadStream(url);
                      lectura.pipe(res);
                    }
                  });
                }
              } catch (errorFolderB) {
                res.status(500).send({mensaje : errorFolderB})
              }
            }
          } catch (errorFolderPadre) {
            res.status(500).send({mensaje : errorFolderPadre});
          }
        }
      });
    }
  }
});

  //METODO PARA OBTENER EL EJERCICIO DE LA RUTINA VIGENTE DE UN PACIENTE ESPECIFICO
    //dato a obtener: id del paciente a conocer, podemos agregar dentro del response la informacion del video o solo colocar el id y con otro metodo obtenerlo
app.get("/obtenEjercicioRutinaPaciente", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      var objeto = {}, data = [];
      //hacemos la busqueda de la informacion y agregamos el musculo que lo realiza
      conn.query(`SELECT er.id_ER, er.cantidad, er.id_video, er.id_ejercicio, er.fechaInicio, er.fechaFin, er.vigencia, ejer.descripcion, mu.nombre_musculo, vid.nombreVideo, vid.video FROM ejercicio_rutina AS er, videos AS vid, ejercicios AS ejer, musculos AS mu WHERE er.id_paciente = ${req.body.id} and er.id_video = vid.id_video and er.id_ejercicio = ejer.id_ejercicio and ejer.id_musculo = mu.id_musculos`, (errorBusquedaERutina, resultadoBusquedaERutina) => {
        if(errorBusquedaERutina){
          res.status(500).send({mensaje : errorBusquedaERutina.name, codigo : errorBusquedaERutina.code});
          throw errorBusquedaERutina;
        }else{
          //console.log(resultadoBusquedaERutina);
          //console.log(resultadoBusquedaERutina.length)
          for(let i = 0; i < resultadoBusquedaERutina.length; i++){
            let fechaIni = new Date(resultadoBusquedaERutina[i].fechaInicio);
            let fechaIniAno = fechaIni.getUTCFullYear();
            let fechaIniMes = fechaIni.getUTCMonth()+1;
            let fechaIniDia = fechaIni.getUTCDate();
            let fechaIniC = ""+fechaIniDia+"-"+fechaIniMes+"-"+fechaIniAno;
            let fechaFin = new Date(resultadoBusquedaERutina[i].fechaFin);
            let fechaFinAno = fechaFin.getUTCFullYear();
            let fechaFinMes = fechaFin.getUTCMonth()+1;
            let fechaFinDia = fechaFin.getUTCDate();
            let fechaFinC = ""+fechaFinDia+"-"+fechaFinMes+"-"+fechaFinAno;
            //console.log(fechaIniC, fechaFinC);
            data.push({
              id_rutina : resultadoBusquedaERutina[i].id_ER,
              nombreEjercicio : resultadoBusquedaERutina[i].descripcion,
              musculo : resultadoBusquedaERutina[i].nombre_musculo,
              cantidad : resultadoBusquedaERutina[i].cantidad,
              nombreVideo : resultadoBusquedaERutina[i].nombreVideo,
              vigencia : resultadoBusquedaERutina[i].vigencia,
              fechaI : fechaIniC,
              fechaFin : fechaFinC,
              id_video : resultadoBusquedaERutina[i].id_video
              //video : resultadoBusquedaERutina[i].video
            });
          }
          objeto.data = data;
          res.status(200).send(objeto);
        }
      });
    }
  }
});

  //METODO PARA OBTENER LA LISTA DE EJERCICIOS DE RUTINA CREADOS POR PROFESIONAL
    //dato a obtener: id del profesional de la salud
app.get("/obtenEjerciciosRutinaProfesional", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({error : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Datps incorrectos"});
    }else{
      const conn = conexion.cone;
      var objeto = {}, data = [];
      conn.query(`SELECT usPac.id_paciente, usPac.nombre, usPac.apMaterno, usPac.apPaterno, er.id_ER, er.cantidad, er.id_video, vid.nombreVideo, er.id_ejercicio, ejer.descripcion, ejer.id_musculo, mu.nombre_musculo, er.fechaInicio, er.fechaFin, er.vigencia FROM ejercicio_rutina AS er, ejercicios AS ejer, musculos AS mu, videos as vid, usuarios_pacientes as usPac WHERE er.id_profesional = ${req.body.id} AND er.id_video = vid.id_video AND er.id_ejercicio = ejer.id_ejercicio AND ejer.id_musculo = mu.id_musculos AND usPac.id_profesional = er.id_profesional`, (errorBusquedaER, resultadoBusquedaER) => {
        if(errorBusquedaER){
          res.status(500).send({mensaje : errorBusquedaER.message, codigo : errorBusquedaER.code});
        }else{
          for(let i = 0; i < resultadoBusquedaER.length; i++){
            let fechaI = new Date(resultadoBusquedaER[i].fechaInicio);
            let fechaIC = fechaI.getUTCFullYear() + "-" + (fechaI.getUTCMonth()+1) + "-" + fechaI.getUTCDate();:
            data.push({
              id_paciente : resultadoBusquedaER[i].id_paciente,
              nombrePaciente : resultadoBusquedaER[i].nombre + " " + resultadoBusquedaER[i].apPaterno + " " + resultadoBusquedaER[i].apMaterno,
              id_ER : resultadoBusquedaER[i].id_ER,
              cantidad : resultadoBusquedaER[i].cantidad,
              id_video : resultadoBusquedaER[i].id_video,
              nombreVideo : resultadoBusquedaER[i].nombreVideo,
              id_ejercicio : resultadoBusquedaER[i].id_ejercicio,
              descripcion : resultadoBusquedaER[i].descripcion,
              id_musculo : resultadoBusquedaER[i].id_musculo,
              nombre_musculo : resultadoBusquedaER[i].nombre_musculo,
              fecha_inicio : resultadoBusquedaER[i].fechaInicio,
              fecha_fin : resultadoBusquedaER[i].fechaFin,
              vigencia : resultadoBusquedaER[i].vigencia
            });
          }
          objeto.data = data;
          res.status(200).send({objeto : objeto});
        }
      });
    }
  }
});

  //METODO DE LOGIN DE USUARIOS
app.get("/login", (req, res) => { //obtenemos del body los datos de correo, password y el tipo de usuario
  //si retorna el permiso como 0, es que no tendra acceso al contenido; de modo que si es un 1 lo tendrá
  if(JSON.stringify(req.body) === "{}"){ //validamos que el contenido de la petición no este vació
    console.log("req vacio");
    res.status(500).send({error : "sin informacion"});
  }else{//validamos que cada elemento que deseamos almacenar no se encuentre vacio
    if(req.body.correo === "" || req.body.password === "" || req.body.tipo === ""){
      console.log('error no hay datos completos');
      res.status(500).send("Error. Datos incompletos");
    }else{
      const conn = conexion.cone;
      //comprobamos el tipo de usuario al que desea ingresar
      /* si es 0 = profesional, si es 1 = paciente */
      if(req.body.tipo == 0){
        conn.query(`SELECT * FROM usuarios_profesionales WHERE email = '${req.body.correo}' and password = '${req.body.password}'`, (errorLogin, resultLogin) => {
          if(errorLogin){
            res.status(500).send({error : "Profesional no existente"});
            throw errorLogin;
          } else{
            if(resultLogin.length > 0){
              //existe el usuario
              res.status(200).send({mensaje : "Usuario encontrado.", permiso : 1});
            }else{
              //no existe
              res.status(500).send({mensaje : "Comprueba los datos", permiso : 0});
            }
          }
        })
      }
    }
  }
});

  //METODOS DE ELIMINACIÓN DE ELEMENTO
app.delete("/borraProfesional", (req, res) => {
  //al eleminar debemos quitar el profesional de la salud o hacer la reasignación en otro metodo 

});

  //METODO PARA ELIMINAR EL CONTENIDO DE UNA CARPETA, EN ESTE CASO videosProfesionales
app.delete("/borrarCarpetasVideos", (req, res) => {
  //console.log("Entrada")
  videos.eliminaArchivosVideo((mensaje, conteo) => {
    if(conteo != 0){//tenemos un error
      //console.log(mensaje, " ", conteo)
      res.send(mensaje);
    }else{
      mensaje = {codigo : 200, mensaje : "Eliminación correcta de archivos (videos)"};
      //console.log(mensaje, " ", conteo)
      res.send(mensaje);
    }
  });
  //console.log("result: ", result)
});

  //METODO PARA ELMINAR UN VIDEO DE LA BASE DE DATOS, UTILIZANDO EL ID COMO PARAMETRO PARA REALIZARLO
    //primero actualizamos los ejercicios que se tengan creados y sean el id del video, despues se realiza la eliminacion del video
app.delete("/borraVideoId", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error, datos incompetos"});
    }else{
      const conn = conexion.cone; //primero realizamos la busqueda de id de eliminacion para comprobar que no exista dentro de alguna rutina de ejercicio
      conn.query(`SELECT * FROM ejercicio_rutina WHERE id_video = ${req.body.id}`, (errorBusquedaER, resultadoBusquedaER) => {
        if(errorBusquedaER){
          res.status(500).send({mensaje : errorBusquedaER.message, codigo : errorBusquedaER.code});
        }else{
          for(let i = 0; i < resultadoBusquedaER.length; i++){
            //realizamos la actualizacion de todos los registros que se encuentren con un valor 0
            conn.query(`UPDATE ejercicio_rutina SET id_video = 0 WHERE id_ER = ${resultadoBusquedaER[i].id_ER}`, (errorActualizacion, resultadoActualizacion) =>{
              if(errorActualizacion){
                res.status(500).send({mensaje : errorActualizacion.message, codigo : errorActualizacion.code});
              }
            });
          }
          //ahora realizamos la eliminacion del video
          conn.query(`DELETE FROM videos WHERE id_video = ${req.body.id}`, (errorEliminacionVideo, resultadoEliminacionVideo) => {
            if(errorEliminacionVideo){
              res.status(500).send({mensaje : errorEliminacionVideo.message, codigo : errorEliminacionVideo.code});
            }else{
              res.status(200).send({mensaje : "Eliminacion exitosa del video con id: "+req.body.id});
            }
          });
        }
      });
    }
  }
});

  //METODOS DE ACTUALIZACIÓN DEL ESTADO DEL USUARIO PROFESIONAL
app.put("/actualizaEstadoProfesional", (req, res) => {
  //obtenemos del body el ID del profesional, el cual sera validado
  if(JSON.stringify(req.body) === "{}"){
    console.log("actualizaEstadoProfesional:\n\treq vacio");
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.idProfesional === ""){
      console.log("actualizaEstadoProfesional:\n\tError no hay datos correctos");
      res.status(500).send({mensaje : "Datos incorrectos"});
    }else{
      const conn = conexion.cone;
      conn.query(`UPDATE usuarios_profesionales SET valido = '1' WHERE id_profesional = ${req.body.idProfesional}`, (errorAct, resultAct) => {
        if(errorAct){
          res.status(500).send({mensaje : errorAct.message, codigo : errorAct.code});
          throw errorAct;
        }else{
          //actualización correcta del profesional
          res.status(200).send({mensaje : "Usuario actualizado"});
        }
      });
    }
  }
});

  //METODO PARA ACTUALIZAR LA INFORMACION DE UN EJERCICIO RUTINA, obtenemos la informacion a modificar
    //dentro de esta funcion realizamos la actualización de una rutina de ejercicio previamente creada
app.put("/actualizaRutinaEjercicio", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.id_ER === "" || req.body.id_profesional === "" || req.body.id_paciente === "" || req.body.cantidad === "" || req.body.id_video === "" || req.body.id_ejercicio === "" || req.body.fechaInicio === "" || req.body.fechaFin === "" ){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      //realizamos la actualizacion de datos
      conn.query(`UPDATE ejercicio_rutina SET cantidad = ${req.body.cantidad}, id_video = ${req.body.id_video}, id_ejercicio = ${req.body.id_ejercicio}, fechaInicio = ${req.body.fechaInicio}, fechaFin = ${req.body.fechaFin} WHERE id_ER = ${body.req.id_ER}`, (errorActua, resultActua) => {
        if(errorActua){
          res.status(500).send({error : errorActua.message, codigo : errorActua.code});
        }else{
          res.status(200).send({mensaje : "Informacion actualizada"});
        }
      });
    }
  }
});

  //METODO PARA OBTENER TODOS LOS ARCHIVOS DE UN USUARIO PROFESIONAL Y ALMACENARLO DENTRO DE LA CARPETA DE ARCHIVOS
    //EN COMPARACIÓN CON LA VERSIÓN PASADA, AHORA ENVIA LA INFORMACIÓN DE LOS ARCHIVOS DENTRO DEL RESPONSE DE LA PETICIÓN
app.get("/obtenArchivosProfesional", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    console.log("Error, no hay datos para la busqueda");
    res.status(500).send({error : "sin informacion"});
  }else{
    if(req.body.id === ""){
      console.log("Error no hay datos");
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM archivos WHERE id_profesional = ${req.body.id}`, (err, result) => {
        if(err){
            throw err;
        }else{
          const nombreFolderPadre = __dirname + "/archivos/archivosProfesionales";
          try {
            if (!fs.existsSync(nombreFolderPadre)) {
              fs.mkdir(nombreFolderPadre, function (errorFolderB) {
                if (errorFolderB) {
                  res.send({
                    mensaje: "No se pudo crear la carpeta",
                    error: errorFolderB,
                  });
                } else {
                  const nombreFolder = __dirname+"/archivos/archivosProfesionales/busqueda_certificados_id_"+req.body.id;
                  try{
                    if(!fs.existsSync(nombreFolder)){
                      fs.mkdir(nombreFolder, function(err){
                        if(err){
                          console.log(err);
                          res.send({mensaje : "No se pudo crear la carpeta",
                                    error : err});
                        }else{
                          var objeto = {};
                          var data = [];
                          for(let i = 0; i < result.length; i++){
                            //var data = Buffer.from(result[i].archivo, 'binary');
                            //console.log(result[i].archivo.toString('base64'))
                            fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/${req.body.id}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                              if(err){
                                console.log("Error escritura de archivos decodificado", err);
                              }
                            });
                            data.push({
                              nombre : result[i].nombreArchivo,
                              info : result[i].archivo
                            });
                          }
                          objeto.data = data;
                          res.status(200).send({mensaje : `Creación correcta de los archivos del usaurio #${req.body.id} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/`, 
                                              archivos : objeto});
                        }
                      });
                    }else{
                      var objeto = {};
                      var data = [];
                      for(let i = 0; i < result.length; i++){
                        //var data = Buffer.from(result[i].archivo, 'binary');
                        //console.log(result[i].archivo.toString('base64'))
                        fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/${req.body.id}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                          if(err){
                            console.log("Error escritura de archivos decodificado", err);
                            }
                        });
                        data.push({
                          nombre : result[i].nombreArchivo,
                          info : result[i].archivo
                        });
                      }
                      objeto.data = data;
                      res.status(200).send({mensaje : `Creación correcta de los archivos del usaurio #${req.body.id} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/`, 
                                          archivos : objeto});
                    }
                  }catch(err){
                    res.status(500).send(err);
                  }
                }
              });
            }else{
              const nombreFolder = __dirname+"/archivos/archivosProfesionales/busqueda_certificados_id_"+req.body.id;
              try{
                if(!fs.existsSync(nombreFolder)){
                  fs.mkdir(nombreFolder, function(err){
                    if(err){
                      console.log(err);
                      res.send({mensaje : "No se pudo crear la carpeta",
                                error : err});
                    }else{
                      var objeto = {};
                      var data = [];
                      for(let i = 0; i < result.length; i++){
                        //var data = Buffer.from(result[i].archivo, 'binary');
                        //console.log(result[i].archivo.toString('base64'))
                        fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/${req.body.id}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                          if(err){
                            console.log("Error escritura de archivos decodificado", err);
                            }
                        });
                        data.push({
                          nombre : result[i].nombreArchivo,
                          info : result[i].archivo
                        });
                      }
                      objeto.data = data;
                      res.status(200).send({mensaje : `Creación correcta de los archivos del usaurio #${req.body.id} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/`, 
                                          archivos : objeto});
                    }
                  });
                }else{
                  var objeto = {};
                  var data = [];
                  for(let i = 0; i < result.length; i++){
                    //var data = Buffer.from(result[i].archivo, 'binary');
                    //console.log(result[i].archivo.toString('base64'))
                    fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/${req.body.id}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                      if(err){
                        console.log("Error escritura de archivos decodificado", err);
                        }
                    });
                    data.push({
                      nombre : result[i].nombreArchivo,
                      info : result[i].archivo
                    });
                  }
                  objeto.data = data;
                  res.status(200).send({mensaje : `Creación correcta de los archivos del usaurio #${req.body.id} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${req.body.id}/`, 
                                      archivos : objeto});
                }
              }catch(err){
                res.status(500).send(err);
              }
            }
          } catch (errorFolderPadre) {
            res.status(500)
              .send({
                mensaje: "Error al crear la carpeta padre",
                error: errorFolderPadre,
              });
            throw errorFolderPadre;
          }
        }
    });
    }
  }
});

  //METODOS DE CONFIGURACIÓN DEL SERVIDOR
app.listen(3000, "192.168.100.9", function () {
  console.log("Funcionando en el puerto: 3000");
});

app.use(function (req, res) {
  res.status(404).send("Error");
});

//para ejecutar el comando de configuración es npm run dev, dev se cambia dependiendo del script a ejecutar

/*
para probar altaprofesionales seguir lo siguiente:
{
    "nombre":"lsjkld",
    "apPaterno":"info",
    "apMaterno":"alkdmaklm",
    "email":"sdfsfsf@gmail.com",
    "edad":29,
    "fechaN":"1995/05/13",
    "pass":"pruebaContra",
    "tipo":"2",
    "archivos":["sdjnflskdjfn", "sfnsldnfskdn"],
    "valido":0
}

datos que obtenemos al hacer el get de obtenTipos

{
    "data": [
        {
            "id": 1,
            "descripcion": "Nutriologo"
        },
        {
            "id": 2,
            "descripcion": "Preparador fisico"
        },
        {
            "id": 3,
            "descripcion": "Nutriologo y preparador fisico"
        }
    ]
}

creacion de citas

{
    "idTipoCita":2,
    "idProfesional":1,
    "idPaciente":2,
    "fechaHora": "2023/09/15 15:30"
}

alta de pacientes

{
    "nombre":"Jesus",
    "apPaterno":"Perez",
    "apMaterno":"Alva",
    "email":"jpa_@mail.com",
    "edad":23,
    "fechaN":"2000/4/20",
    "numTel":"5544112233",
    "pass":"ContraJPA",
    "idProfesional": 3
}

creacion de citas 

{
    "idTipoCita":1,
    "idProfesional":3,
    "idPaciente":1,
    "fechaHora": "2023/09/20 16:00"
}

obten citas fecha hora
    EJEMPLO DEL BODY DE LA PETICIÓN
    {
      "fecha":"-09-",
      "hora":""
    }

{
    "data": [
        {
            "idTipoCita": 2,
            "tipoCita": "En linea",
            "id_profesional": 1,
            "nombreProfesional": "lsjkld info alkdmaklm",
            "id_paciente": 2,
            "nombrePaciente": "Jesus Perez Alva",
            "fecha": "15-9-2023",
            "hora": "15:30:0"
        },
        {
            "idTipoCita": 1,
            "tipoCita": "Presencial",
            "id_profesional": 3,
            "nombreProfesional": "Carlos Diaz Lopez",
            "id_paciente": 1,
            "nombrePaciente": "Oswaldo Ramirez Mora",
            "fecha": "20-9-2023",
            "hora": "16:0:0"
        }
    ]
}

obtenCitasProfesional

  EJEMPLO DEL BODY DE LA PETICIÓN
  {
    "id" : 1
  }

{
    "data": [
        {
            "idTipoCita": 2,
            "tipoCita": "En linea",
            "id_profesional": 1,
            "nombreProfesional": "lsjkld info alkdmaklm",
            "id_paciente": 2,
            "nombrePaciente": "Jesus Perez Alva",
            "fecha": "15-9-2023",
            "hora": "15:30:0"
        }
    ]
}

obtenCitasPaciente
  EJEMPLO DEL BODY DE LA PETICIÓN
  {
    "id":2
  }


{
    "data": [
        {
            "idTipoCita": 2,
            "tipoCita": "En linea",
            "id_profesional": 1,
            "nombreProfesional": "lsjkld info alkdmaklm",
            "id_paciente": 2,
            "nombrePaciente": "Jesus Perez Alva",
            "fecha": "15-9-2023",
            "hora": "15:30:0"
        },
        {
            "idTipoCita": 1,
            "tipoCita": "Presencial",
            "id_profesional": 4,
            "nombreProfesional": "Ernesto Gutierrez Macarena",
            "id_paciente": 2,
            "nombrePaciente": "Jesus Perez Alva",
            "fecha": "30-8-2023",
            "hora": "11:46:0"
        },
        {
            "idTipoCita": 1,
            "tipoCita": "Presencial",
            "id_profesional": 2,
            "nombreProfesional": "Jesus Prueba Prueba",
            "id_paciente": 2,
            "nombrePaciente": "Jesus Perez Alva",
            "fecha": "30-8-2023",
            "hora": "13:50:0"
        }
    ]
}

cargaArchivos
  el body debe de enviarse como form-data, donde se tienen las key's
  archivo : es donde estan los archivos a enviar
  id : identificador del usuario asignar el archivo

  salida: {
    "mensaje": "archivo cargado"
}
*/
