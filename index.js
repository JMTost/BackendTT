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
var fechaApi; //variable que tendra la fecha de México CDMX

//archivo de correo electronico
const correoEnvio = require("./correo");
const ejemplosCorreo = require("./ejemplosCorreo");

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

app.get("/prueba", (req, res) => {//Método empleado para comprobar la obtención de datos de API´s externas
  console.log(fechaApi);
  res.send({mensaje : "Fecha de la Ciudad de México: "+fechaApi});
});

app.get("/actualiza/fecha", (req, res) =>{//Método para actualizar la variable de la fecha
  apis.apiTiempo()
  .then(data => {//obtenemos la fecha actual en CDMX
    //separamos los elementos
    let partes = data.split('-');
    const anoAPI = partes[0];
    const mesAPI = partes[1];
    const diaAPI = partes[2];
    fechaApi += anoAPI+'-'+mesAPI+"-"+diaAPI;
    //console.log(fechaApi);
    res.status(200).send({mensaje : "actualización de fecha exitoso: "+fechaApi});
  })
  .catch(error => {
    console.error("Error dentro de la petición", error);
    res.status(500).send({mensaje : "Error al obtener el dato", error : error});
  });
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
  //console.log(archivoObtenido);
  if(archivoObtenido.length > 1){
    for(let i = 0; i < archivoObtenido.length; i++){
      const query = "INSERT INTO archivos VALUES (?, ?, ?)";
      conn.query(query, [id, id+' '+archivoObtenido[i].name, archivoObtenido[i].data], (error, resultInsert) => {
        if(error){
          res.status(500).send({mensaje : "Error en la carga de archivos"});
        }
      });
    }
    res.status(200).send({mensaje : 'archivo cargado'});
  }else{
    const query = "INSERT INTO archivos VALUES (?, ?, ?)";
      conn.query(query, [id, id+' '+archivoObtenido.name, archivoObtenido.data], (error, resultInsert) => {
        if(error){
          res.status(500).send({mensaje : "Error en la carga de archivos"});
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
  //console.log(req.body)
  //valores a almacenar:
  /*
    nombre, apPaterno, apMaterno, email, edad, fechaN, pass, tipo, archivos, valido = 0
    */
  if (JSON.stringify(req.body) === "{}") {
    //validamos que el contenido de la petición no este vacío
    console.error("req vacio");
    res.status(500).send({ error: "sin informacion" });
  } else {
    //validamos que cada elemento que deseamos almacenar no se encuentre vacio
    if (req.body.nombre === "" || req.body.apPaterno === "" || req.body.apMaterno === "" || req.body.email === "" ||( req.body.edad < 0 || req.body.edad > 100) || req.body.fechaN === "" || req.body.pass === ""  || req.body.numTel === "") {
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
          //let info = `INSERT INTO usuarios_profesionales VALUES (0, '${req.body.nombre}', '${req.body.apPaterno}', '${req.body.apMaterno}', '${req.body.email}', ${req.body.edad}, '${req.body.fechaN}', '${req.body.pass}', ${req.body.tipo}, '0')` //en este caso el valor de valido se pone en 0, debido a que debe entrar en proceso de validar los documentos que proporcion
          //console.log(`INSERT INTO usuarios_profesionales VALUES (0, '${req.body.nombre}', '${req.body.apPaterno}', '${req.body.apMaterno}', '${req.body.email}', ${req.body.edad}, '${req.body.fechaN}', '${req.body.numTel}', '${req.body.pass}', ${req.body.tipo}, '0', '${req.body.direccion}')`);
          
          conn.query(`INSERT INTO usuarios_profesionales VALUES (0, '${req.body.nombre}', '${req.body.apPaterno}', '${req.body.apMaterno}', '${req.body.email}', ${req.body.edad}, '${req.body.fechaN}', '${req.body.numTel}', '${req.body.pass}', ${req.body.tipo}, '0', '${req.body.direccion}')`, function (errInsert, resultInsert) {
            if (errInsert){
              res.status(500).send({mensaje : errInsert.message, codigo : errInsert.code});
            }else {
              ejemplosCorreo.creacionUsuarioProfesional(req.body.nombre, req.body.apPaterno, req.body.apMaterno, (html) => {
                correoEnvio.crearOpcionesCorreo(""+correo, "¡Bienvenido/a a 2BFit! Acceso como Profesional de la Salud", html);
                correoEnvio.enviaCorreo((objeto) => {
                  if(objeto.OK == 1){
                    res.status(200).send({mensaje : "Creacion exitosa de usuario"});
                  }else if(objeto.OK == 0){
                    res.status(500).send({mensaje : "Error en el envio del correo, compruebe el correo"});
                  }
                });
              });
            }
          });
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
                        //console.log("Creación de usuario e historial exitoso");
                        ejemplosCorreo.creacionUsuarioPaciente(req.body.nombre, req.body.apPaterno, req.body.apMaterno, (html) => {
                          correoEnvio.crearOpcionesCorreo(""+correo, "¡Bienvenido/a a 2BFit! Detalles Importantes a Considerar", html);
                          correoEnvio.enviaCorreo((objeto) => {
                            if(objeto.OK == 1){
                              res.send({mensaje:"Creación exitosa"}).status(200);
                            }else if(objeto.OK == 0){
                              res.status(500).send({mensaje : "Error en el envio del correo, compruebe el correo"});
                            }
                          });
                        });
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
            //extension[1]
            conn.query(query, [id, 'png', archivoObtenido.data], (error, resultInsert) => {
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
        //extension[1]
        conn.query(query, [id, 'png', archivoObtenido.data], (error, resultInsert) => {
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
  //console.log(req.body)
  const conn = conexion.cone;
  let archivoObtenido = req.files.img;
  let id = req.body.id;
  let extension = archivoObtenido.name.split('.');
  //console.log(archivoObtenido);
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
            //extension[1]
            conn.query(query, [id, 'png', archivoObtenido.data], (errorInsert, resultInsert) => {
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
        //extension[1]
        conn.query(query, [id, 'png', archivoObtenido.data], (errorInsert, resultInsert) => {
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

  //METODO DE ALTA DE MEDICIONES 
app.post("/altaMedicion", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){//validamos que el contenido de la petición no este vacío
    res.status(500).send({error : "Sin información"});
  }else{
    //validamos que contamos con los datos necesarios
    if(req.body.id_profesional === "" || req.body.id_paciente === "" || req.body.peso === "" || req.body.axiliar_media === "" || req.body.abdominal === "" || req.body.bicipital === "" || req.body.muslo === "" || req.body.suprailiaco === "" || req.body.triceps === "" || req.body.subescapular === "" || req.body.toracica === "" || req.body.pantorrilla_medial === "" || req.body.cintura === "" || req.body.fecha === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      //console.log(req.body);
      conn.query(`INSERT INTO mediciones VALUES (${req.body.id_profesional}, ${req.body.id_paciente}, ${req.body.peso}, ${req.body.axiliar_media}, ${req.body.abdominal}, ${req.body.bicipital}, ${req.body.muslo}, ${req.body.suprailiaco}, ${req.body.triceps}, ${req.body.subescapular}, ${req.body.toracica}, ${req.body.pantorrilla_medial}, ${req.body.cintura}, '${req.body.fecha}')`, (errorInsert, resultInsert) => {
        if(errorInsert){
          //console.log(errorInsert)
          res.status(500).send({mensaje : errorInsert.message, codigo : errorInsert.code});
        }
        else{
          res.status(200).send({mensaje : "Creación correcta de medicion"});
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
      res.status(200).send({objeto : objeto});
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
//actualizacion
app.get("/obtenPacientes", (req, res) => {
  const conn = conexion.cone;
  conn.query("select id_paciente, nombre, apPaterno, apMaterno from usuarios_pacientes", (err, result) => {
    if(err){
      res.send(err).status(500);
      throw err;
    }else{
      var objeto = {};
      var data = [];
      for (let i = 0; i < result.length; i++) {
        data.push({
          id: result[i].id_paciente,
          nombreC: result[i].nombre + " " + result[i].apPaterno + " " + result[i].apMaterno,
        });
      }
      objeto.data = data;
      res.send(objeto).status(200);
    }
  });
});

//OBTENCIÓN DE PACIENTES MEDIANTE EL IDENTIFICADOR DEL PROFESIONAL
app.get("/obtenPacientesProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
  if(!idProfesional){
    console.log('error no hay datos completos');
    res.status(500).send("Error. Datos incompletos");
  }else{
    const conn = conexion.cone;
    conn.query("SELECT * FROM usuarios_pacientes WHERE id_profesional = ?", [idProfesional], (errorObtencion, resultObtencion) => {
      if(errorObtencion){
        res.status(500).send({error : "Error al realizar la operacion", errorC : errorObtencion});
      }else{
        if(resultObtencion.length > 0){
          var objeto = {}, data = [];
          for(let i = 0; i < resultObtencion.length; i++){
            data.push({
              id : resultObtencion[i].id_paciente,
              nombreC : resultObtencion[i].nombre + " " + resultObtencion[i].apPaterno + " " + resultObtencion[i].apMaterno,
              num : resultObtencion[i].numTel
            });
          }
          objeto.data = data;
          res.status(200).send(objeto);
        }else{
          res.status(404).send({mensaje : "No se cuenta con pacientes"});
        }
      }
    });
  }
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

app.get("/obtenCitasFechaHora/:fecha/:hora", (req, res) => { //metodo que obtendra del body la fecha o hora a buscar
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
 const fecha = req.params.fecha || '';
 const hora = req.params.hora || '';
    //comprobamos que existan alguno de los elementos
    if(fecha === "" && hora === ""){//caso donde se tienen los elementos pero no contienen datos
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos en ambos campos");
    }else{//al menos uno de los elementos se encuentra con información
      //select * from citas WHERE fecha_hora LIKE '%:%0:%';
      //`SELECT * FROM citas WHERE fecha_hora LIKE ('%${req.body.fecha}% %${req.body.hora}%')`
      const conn = conexion.cone;
      //obtenemos datos de la cita, el nombre del tipo de cita, del profesional y del paciente
      conn.query(`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE fecha_hora LIKE  ('%${fecha}% %${hora}%') and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente`, (error, result) => {
        if(error){
          res.send(error).status(500);
          throw error;
        }else if(result.length > 0){
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
        }else{
          res.status(404).send({mensaje : "Sin información"});
        }
      });
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
        if(result[i].id_profesional != 0){
          data.push({
            id : result[i].id_profesional,
            nombreC : result[i].nombre + " " + result[i].apPaterno + " " + result[i].apMaterno
          });
        }
      }
      objeto.data = data;
      res.status(200).send(objeto);
    }
  });
});

    //AGREGAR PARAMETROS PARA OBTENER EL STATUS DE LA CITA MEDIANTE LA FECHA

app.get("/obtenCitasProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
    //comprobamos que exista el elemento del ID a buscar
    if(!idProfesional){
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos");
    }else{
      const conn = conexion.cone;
      var objeto = {};
      var data = [];
      //obtenemos datos de la cita, el nombre del tipo de cita, del paciente
      //`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE id_profesional = ${req.body.id_profesional} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente` 
      conn.query(`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_profesional = ${idProfesional} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = ${idProfesional} and pa.id_paciente = c.id_paciente`, (error, result) => {
        if(error){
          res.status(500).send({mensaje : "Error al obtener los datos"});
        }else if(result.length > 0){
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
        }else{
          res.status(404).send({mensaje : "Informacíón no encontrada"});
        }
      });
    }
});

app.get("/obtenCitasPaciente/:id", (req, res) => {
  const idPaciente = req.params.id;
    if(!idPaciente){
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos");
    }else{
      const conn = conexion.cone;
      var objeto = {};
      var data = [];
      conn.query(`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_paciente = ${idPaciente} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = ${idPaciente}`, (error, result) => {
        if(error){
          res.status(500).send({mensaje : "Error en la obtención de datos"});
        }else if(result.length > 0){
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
        }else{
          res.status(404).send({mensaje : "Sin información"});
        }
      });
    }
});

  //OBTENCIÓN DE PROXIMAS CITAS SIMILAR A LOS MÉTODOS PASADOS

app.get("/obtenProximasCitas/:fecha/:hora", (req, res) => { //método que obtendrá del body la fecha o hora a buscar
  const fecha = req.params.fecha || '';
  const hora  = req.params.hora || '';
      //comprobamos que existan alguno de los elementos
      if(fecha === "" && hora === ""){
        console.log("Error no hay datos completos");
        res.status(500).send("Error, no hay datos en ambos campos");
      }else{
        const conn = conexion.cone;
        conn.query(`SELECT c.id_profesional, c.id_paciente, c.fecha_hora, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM proximas_citas AS c, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE fecha_hora LIKE  ('%${fecha}% %${hora}%') and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente`, (error, result) => {
          if(error){
            res.send(error).status(500);
            throw error;
          }else if(result.length > 0){
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
          }else{
            res.status(404).send({mensaje : "sin información"});
          }
        });
    }
  });

  //AGREGAR PARAMETROS PARA OBTENER EL STATUS DE LA CITA MEDIANTE LA FECHA

app.get("/obtenProximasCitasProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
      //comprobamos que exista el elemento del ID a buscar
      if(!idProfesional){
        console.log("Error no hay datos completos");
        res.status(500).send("Error, no hay datos");
      }else{
        const conn = conexion.cone;
        var objeto = {};
        var data = [];
        //obtenemos datos de la cita, el nombre del tipo de cita, del paciente
        //`SELECT c.id_tipoCita, c.id_profesional, c.id_paciente, c.fecha_hora, t.descripcion, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM citas AS c, tipocitas AS t, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE id_profesional = ${req.body.id_profesional} and t.id_tipoCita = c.id_tipoCita and p.id_profesional = c.id_profesional and pa.id_paciente = c.id_paciente` 
        conn.query(`SELECT c.id_profesional, c.id_paciente, c.fecha_hora, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM proximas_citas AS c, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_profesional = ${idProfesional} and p.id_profesional = ${idProfesional} and pa.id_paciente = c.id_paciente`, (error, result) => {
          if(error){
            res.status(500).send({mensaje : "Error al obtener los datos"});
          }else if(result.length > 0){
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
          }else{
            res.status(404).send({mensaje : "Sin información"});
          }
        });
    }
  });

app.get("/obtenProximasCitasPaciente/:id", (req, res) =>{
  const idPaciente = req.params.id;
    if(!idPaciente){
      console.log("Error no hay datos completos");
      res.status(500).send("Error, no hay datos");
    }else{
      const conn = conexion.cone;
      var objeto = {};
      var data = [];
      conn.query(`SELECT c.id_profesional, c.id_paciente, c.fecha_hora, p.nombre AS profesionalN, p.apPaterno AS profesionalAPp, p.apMaterno AS profesionalAPm, pa.nombre AS pacienteN, pa.apPaterno AS pacienteAPp, pa.apMaterno AS pacienteAPm FROM proximas_citas AS c, usuarios_profesionales AS p, usuarios_pacientes AS pa WHERE c.id_paciente = ${idPaciente} and p.id_profesional = c.id_profesional and pa.id_paciente = ${idPaciente}`, (error, result) => {
        if(error){
          res.status(500).send("Error al obtener los datos");
        }else if(result.length > 0){
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
        }else{
          res.status(404).send({mensaje : "Sin información"});
        }
      });
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
      res.status(200).send(objeto);
    }
  });
});

  //METODO PARA OBTENER LA IMAGEN DEL PROFESIONAL DENTRO DE LA BD
app.get("/obtenImgProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
  //console.log(idProfesional);
    if(!idProfesional){
      console.log("Error no hay datos");
      res.send(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM imgUsuariosProfesionales WHERE id_profesional = ${idProfesional}`, (err, result) =>{
        if(err){
          res.status(500).send({error : err});
          throw err;
        }else{
          if(result.length > 0){
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
                    const nombreFolder = "./archivos/imgProfesionales/id_"+idProfesional;
                    try{
                      if(!fs.existsSync(nombreFolder)){
                        fs.mkdir(nombreFolder, function(error){
                          if(error){
                            console.log(error);
                            res.send({mensaje: "No se pudo crear la carpeta",
                                      error : error});
                          }else{
                            var url = `${nombreFolder}/${idProfesional}_img.`+result[0].extension;
                            fs.writeFile(url, result[0].img, (err) => {
                              if(err){
                                console.log("Error escritura de archivos decodificado", err);
                                }else{
                                  //intentamos hacer el envio de la img
                                  var stat = fs.statSync(`./archivos/imgProfesionales/id_${idProfesional}_img.${result[0].extension}`);
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
                        var url = `${nombreFolder}/${idProfesional}_img.`+result[0].extension;
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
                const nombreFolder = "./archivos/imgProfesionales/id_"+idProfesional;
                try{
                  if(!fs.existsSync(nombreFolder)){
                    fs.mkdir(nombreFolder, function(error){
                      if(error){
                        console.log(error);
                        res.send({mensaje: "No se pudo crear la carpeta",
                                  error : error});
                      }else{
                        var url = `${nombreFolder}/${idProfesional}_img.`+result[0].extension;
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
                    var url = `${nombreFolder}/${idProfesional}_img.`+result[0].extension;
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
          }else{
            res.status(200).sendFile(__dirname+"/archivos/imgGeneral/noPhotoUser.png");
            //console.log(res);
          }
        }
      });
    }
});

  //METODO PARA OBTENER LA IMAGEN DEL PACIENTE DENTRO DE LA ID
app.get("/obtenImgPaciente/:id", (req, res) => {
  const idPaciente = req.params.id;
    if(!idPaciente){
      console.log("Error no hay datos");
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM imgUsuariosPacientes WHERE id_paciente = ${idPaciente}`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          res.status(500).send({error : errorBusqueda});
          throw errorBusqueda;
        }else{
          if(resultBusqueda.length > 0){//contamos con una img del paciente
            const nombreFolderPadre = "./archivos/imgPacientes";
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
                  const nombreFolder = "./archivos/imgPacientes/id_" +idPaciente;
                  try{
                    if(!fs.existsSync(nombreFolder)){
                      fs.mkdir(nombreFolder, function(error){
                        if(error){
                          console.log(error);
                          res.send({mensaje : "No se pudo crear la carpeta base",
                                    error : error});
                        }else{
                          var url = `${nombreFolder}/${idPaciente}_img.`+resultBusqueda[0].extension;
                          fs.writeFile(url, resultBusqueda[0].img, (err) => {
                            if(err){
                              console.log("Error escritura de archivos decodificado", err);
                            }else{
                              //intentamos hacer el envio de la img
                              var stat = fs.statSync(`./archivos/imgPacientes/id_${idPaciente}/${idPaciente}_img.${resultBusqueda[0].extension}`);
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
                      var url = `${nombreFolder}/${idPaciente}_img.`+resultBusqueda[0].extension;
                      fs.writeFile(url, resultBusqueda[0].img, (err) => {
                        if(err){
                          console.log("Error escritura de archivos decodificado", err);
                        }else{
                          //intentamos hacer el envio de la img
                          var stat = fs.statSync(url);
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
                const nombreFolder = "./archivos/imgPacientes/id_" +idPaciente;
                  try{
                    if(!fs.existsSync(nombreFolder)){
                      fs.mkdir(nombreFolder, function(error){
                        if(error){
                          console.log(error);
                          res.send({mensaje : "No se pudo crear la carpeta base",
                                    error : error});
                        }else{
                          var url = `${nombreFolder}/${idPaciente}_img.`+resultBusqueda[0].extension;
                          fs.writeFile(url, resultBusqueda[0].img, (err) => {
                            if(err){
                              console.log("Error escritura de archivos decodificado", err);
                            }else{
                              //intentamos hacer el envio de la img
                              var stat = fs.statSync(url);
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
                      var url = `${nombreFolder}/${idPaciente}_img.`+resultBusqueda[0].extension;
                      fs.writeFile(url, resultBusqueda[0].img, (err) => {
                        if(err){
                          console.log("Error escritura de archivos decodificado", err);
                        }else{
                          //intentamos hacer el envio de la img
                          var stat = fs.statSync(url);
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
          }else{
            res.status(200).sendFile(__dirname+"/archivos/imgGeneral/noPhotoUser.png");
          }
        }
      });
    }
});

  //METODO PARA OBTENER LOS VIDEOS DE LOS PROFESIONALES DE LA SALUD MEDIANTE EL ID DE USUARIO
app.get("/obtenVideosProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
    if(!idProfesional){
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM videos WHERE id_profesional = ${idProfesional}`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          res.status(500).send({error : errorBusqueda});
          throw errorBusqueda;
        }else{
          if(resultBusqueda.length > 0){//contamos con videos
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
                    const nombreFolder = __dirname+"/archivos/videosProfesionales/video_"+idProfesional;
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
                const nombreFolder = __dirname+"/archivos/videosProfesionales/video_"+idProfesional;
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
          }else{//no hay videos
            res.status(404).send({mensaje : "El profesional no cuenta con videos que mostrar"});
          }
        }
      });
    }
});

  //METODO PARA OBTENER EL LISTADO DE NOMBRE DE LOS VIDEOS POR PROFESIONAL DE LA SALUD, ESTE SERVIRA PARA LA CREACIÓN DE RUTINAS
app.get("/obtenListaVideoProfesional/:id", (req, res) => {//OBTENEMOS EL ID DEL PROFESIONAL Y RETORNA EL LISTADO ASOCIADO DE VIDEOS DE ESTE PROFESIONAL
  const idProfesional = req.params.id;
    if(!idProfesional){
      console.log("Error no hay datos");
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT id_video, nombreVideo FROM videos WHERE id_profesional = ${idProfesional}`, (errorBusqueda, resultadoBusqueda) => {
        if(errorBusqueda){
          res.status(500).send({error : errorBusqueda});
          throw errorBusqueda;
        }else{
          //console.log(resultadoBusqueda.length);
          if(resultadoBusqueda.length > 0){//obtenemos los videos
            var objeto = {}, data = [];
            for(let i = 0; i < resultadoBusqueda.length; i++){
              data.push({
                id_video : resultadoBusqueda[i].id_video,
                nombre : resultadoBusqueda[i].nombreVideo,
                id_profesional : idProfesional
              });
            }
            objeto.data = data;
            res.status(200).send(objeto);
          }else{//no hay videos dado el valor a buscar
            res.status(404).send({mensaje : "Este profesional no cuenta con videos para enlistar"});
          }
        }
      });
    }
});

  //METODO PARA OBTENER LA INFORMACION NECESARIA PARA CREAR EL EJERCICIO DE UNA RUTINA
    //EN ESTE METODO OBTENEMOS EL ID DEL PROFESIONAL PARA HACER LA OBTENCION DE LA INFO NECESARIA
app.get("/obtenInfoCreaRutina/:id", (req, res) => {//se retorna la lista de pacientes, lista de ejercicios con sus musculos y la lista de videos que el profesional tiene cargados
  const idProfesional = req.params.id;
  
    if(!idProfesional){
      console.log("Error no hay datos completos");
      res.status(500).send({error : "Error no hay datos"});
    }else{
      const conn = conexion.cone;
      var objeto = {}, usuarios = [], ejercicios = [], musculos = [], videos = [];
      //var query = `SELECT usPac.id_paciente, usPac.nombre, usPac.apPaterno, usPac.apMaterno, ejer.id_ejercicio, ejer.id_musculo, mu.nombre_musculo, vid.id_video, vid.nombreVideo FROM usuarios_pacientes AS usPac, ejercicios AS ejer, musculos AS mu, videos AS vid WHERE  usPac.id_profesional = ${req.body.id} AND vid.id_profesional = ${req.body.id} AND ejer.id_musculo = mu.id_musculos`;
        //primero obtenemos los datos de sus pacientes
      conn.query(`SELECT id_paciente, nombre, apPaterno, apMaterno FROM usuarios_pacientes WHERE id_profesional = ${idProfesional}`, (errorBusquedaUsuario, resultBusquedaUsuario) => {
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
                  conn.query(`SELECT id_video, nombreVideo from videos WHERE id_profesional = ${idProfesional}`, (errorBusquedaVideos, resultBusquedaVideos) => {
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
});

  //METODO PARA OBTENER EL VIDEO MEDIANTE UN ID DEL MISMO DADA UNA PREVIA OBTENCIÓN DEL MISMO
    //EN ESTE METODO OBTENEMOS EL ID DEL VIDEO A BUSCAR Y RETORNAMOS EL VIDEO
    //Al recibir la respuesta de la request, hacer la eliminación de los archivos
    //DENTRO DEL STATUS MESSAGE SE TIENE EL NOMBRE DEL VIDEO, CON LA FINALIDAD DE ALMACENARLO CON EL NOMBRE QUE CORRESPONDE
app.get("/obtenVideoPorId/:id", (req, res) => {
  const idVideo = req.params.id;
    if(!idVideo){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM videos WHERE id_video = ${idVideo}`, (errorBusquedaVideo, resultadoBusquedaVideo) => {
        if(errorBusquedaVideo){
          res.status(500).send({mensaje : errorBusquedaVideo.message, codigo : errorBusquedaVideo.code});
        }else{
          //validamos que haya registros
          if(resultadoBusquedaVideo.length > 0){//encontramos el video
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
            
          }else{
            res.status(200).send({mensaje : "No hay archivos de video que se puedan obtener dado el identificador"});
          }
        }
      });
    }
});

app.get("/obtenVideoPorNombre/:id/:nombre", (req, res) => {
  const idVideo = req.params.id;
    if(!idVideo){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM videos WHERE id_video = ${idVideo}`, (errorBusquedaVideo, resultadoBusquedaVideo) => {
        if(errorBusquedaVideo){
          res.status(500).send({mensaje : errorBusquedaVideo.message, codigo : errorBusquedaVideo.code});
        }else{
          //validamos que haya registros
          if(resultadoBusquedaVideo.length > 0){//encontramos el video
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
            
          }else{
            res.status(200).send({mensaje : "No hay archivos de video que se puedan obtener dado el identificador"});
          }
        }
      });
    }
});

  //METODO PARA OBTENER EL EJERCICIO DE LA RUTINA VIGENTE DE UN PACIENTE ESPECIFICO
    //dato a obtener: id del paciente a conocer, podemos agregar dentro del response la informacion del video o solo colocar el id y con otro metodo obtenerlo
app.get("/obtenEjercicioRutinaPaciente/:id", (req, res) => {
  const idPaciente = req.params.id;
  
    if(!idPaciente){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      var objeto = {}, data = [];
      //hacemos la busqueda de la informacion y agregamos el musculo que lo realiza
      conn.query(`SELECT er.id_ER, er.cantidad, er.id_video, er.id_ejercicio, er.fechaInicio, er.fechaFin, er.vigencia, ejer.descripcion, mu.nombre_musculo, vid.nombreVideo, vid.video FROM ejercicio_rutina AS er, videos AS vid, ejercicios AS ejer, musculos AS mu WHERE er.id_paciente = ${idPaciente} and er.id_video = vid.id_video and er.id_ejercicio = ejer.id_ejercicio and ejer.id_musculo = mu.id_musculos`, (errorBusquedaERutina, resultadoBusquedaERutina) => {
        if(errorBusquedaERutina){
          res.status(500).send({mensaje : errorBusquedaERutina.name, codigo : errorBusquedaERutina.code});
          throw errorBusquedaERutina;
        }else if(resultadoBusquedaERutina.length > 0){
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
        }else{
          res.status(404).send({mensaje : "No se encontro información"});
        }
      });
    }
});

  //METODO PARA OBTENER LA LISTA DE EJERCICIOS DE RUTINA CREADOS POR PROFESIONAL
    //dato a obtener: id del profesional de la salud
app.get("/obtenEjerciciosRutinaProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
    if(!idProfesional){
      res.status(500).send({mensaje : "Datps incorrectos"});
    }else{
      const conn = conexion.cone;
      var objeto = {}, data = [];
      conn.query(`SELECT usPac.id_paciente, usPac.nombre, usPac.apMaterno, usPac.apPaterno, er.id_ER, er.cantidad, er.id_video, vid.nombreVideo, er.id_ejercicio, ejer.descripcion, ejer.id_musculo, mu.nombre_musculo, er.fechaInicio, er.fechaFin, er.vigencia FROM ejercicio_rutina AS er, ejercicios AS ejer, musculos AS mu, videos as vid, usuarios_pacientes as usPac WHERE er.id_profesional = ${idProfesional} AND er.id_video = vid.id_video AND er.id_ejercicio = ejer.id_ejercicio AND ejer.id_musculo = mu.id_musculos AND usPac.id_profesional = er.id_profesional`, (errorBusquedaER, resultadoBusquedaER) => {
        if(errorBusquedaER){
          res.status(500).send({mensaje : errorBusquedaER.message, codigo : errorBusquedaER.code});
        }else if(resultadoBusquedaER.length > 0){
          for(let i = 0; i < resultadoBusquedaER.length; i++){
            let fechaI = new Date(resultadoBusquedaER[i].fechaInicio);
            let fechaIC = fechaI.getUTCFullYear() + "-" + (fechaI.getUTCMonth()+1) + "-" + fechaI.getUTCDate();
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
        }else{
          res.status(404).send({mensaje : "No se encontro información"});
        }
      });
    }
  
});

  //METODO DE LOGIN DE USUARIOS
app.get("/login/:correo/:password/:tipo", (req, res) => { //obtenemos del body los datos de correo, password y el tipo de usuario
  //si retorna el permiso como 0, es que no tendra acceso al contenido; de modo que si es un 1 lo tendrá
  const correo = req.params.correo;
  const password = req.params.password;
  const tipo = req.params.tipo;
  //validamos que cada elemento que deseamos almacenar no se encuentre vacio
    if(!correo || !password || !tipo){
      console.log('error no hay datos completos');
      res.status(500).send("Error. Datos incompletos");
    }else{
      const conn = conexion.cone;
      //comprobamos el tipo de usuario al que desea ingresar
      /* si es 0 = profesional, si es 1 = paciente */
      if(tipo == 0){
        //actualizacion del query para obtener las imagenes de los profesoinales y eniarlo directo al cliente
        conn.query(`SELECT u.id_profesional, u.nombre, u.apPaterno, u.apMaterno, u.valido, img.extension, img.img FROM usuarios_profesionales as u LEFT JOIN imgUsuariosProfesionales as img ON u.id_profesional = img.id_profesional WHERE u.email = '${correo}' AND u.password = '${password}'`, (errorLogin, resultLogin) => {
          if(errorLogin){
            res.status(500).send({error : "Profesional no existente"});
            throw errorLogin;
          } else{
            if(resultLogin.length > 0 && resultLogin[0].valido != '2'){
              //existe el usuario
              if(resultLogin[0].img !== null){//comprobaamos que tenga una imagen asignada
                res.status(200).send({
                  mensaje : "Usuario encontrado.", 
                  permiso : 1,
                  tipo : "profesional",
                  id : resultLogin[0].id_profesional,
                  nombreC : resultLogin[0].nombre + " " + resultLogin[0].apPaterno + " " + resultLogin[0].apMaterno,
                  valido : resultLogin[0].valido,
                  imgExtension : resultLogin[0].extension,
                  img : resultLogin[0].img
                });
              }else{//caso que no cuenta con una imagen
                //realizamos la lectura del archivo general de usuario
                fs.readFile(__dirname+"/archivos/imgGeneral/noPhotoUser.png", (errorLectura, dataLectura) => {
                  if(errorLectura){
                    res.status(500).send({mensaje : errorLectura.message, codigo : errorLectura.code});
                  }else{
                    res.status(200).send({
                      mensaje : "Usuario encontrado.", 
                      permiso : 1,
                      tipo : "profesional",
                      id : resultLogin[0].id_profesional,
                      nombreC : resultLogin[0].nombre + " " + resultLogin[0].apPaterno + " " + resultLogin[0].apMaterno,
                      valido : resultLogin[0].valido,
                      imgExtension : 'png',
                      img : dataLectura
                    });
                  }
                });
              }
            }else if(resultLogin.length > 0){
              //no existe
              let razon = "";
              console.log(resultLogin, correo, password, tipo)
              if(resultLogin[0].valido === '2')
                razon = "Usuario deshabilitado";
              else
                razon = "Valores erroneos";
              res.status(500).send({mensaje : "Comprueba los datos", permiso : 0, razon : razon});
            }else{
              res.status(500).send({mensaje : "Comprueba los datos", permiso : 0});
            }
          }
        });
      }else{ //caso de usuario paciente
        conn.query(`SELECT u.id_paciente, u.nombre, u.apPaterno, u.apMaterno, img.extension, img.img FROM usuarios_pacientes as u LEFT JOIN imgUsuariosPacientes as img ON u.id_paciente = img.id_paciente WHERE u.email = '${correo}' AND u.password = '${password}'`, (errorLogin, resultLogin) => {
          if(errorLogin){
            res.status(500).send({error : errorLogin.message, codigo : errorLogin.code});
          }else{
            //console.log(resultLogin);
            if(resultLogin.length > 0 && resultLogin[0].valido != '2'){
              //existe el usuario
              if(resultLogin[0].img !== null){//comprobamos que tenga una imagen asignada
                res.status(200).send({
                  mensaje : "Usuario encontrado.", 
                  permiso : 1, 
                  tipo : "paciente",
                  id : resultLogin[0].id_paciente,
                  nombreC : resultLogin[0].nombre + " " + resultLogin[0].apPaterno + " " + resultLogin[0].apMaterno,
                  imgExtension : resultLogin[0].extension,
                  img : resultLogin[0].img
                });
              }else{//caso que no cuenta con una imagen
                //realizamos la lectura del archivo general de usuario
                fs.readFile(__dirname+"/archivos/imgGeneral/noPhotoUser.png", (errorLectura, dataLectura) => {
                  if(errorLectura){
                    res.status(500).send({mensaje : errorLectura.message, codigo : errorLectura.code});
                  }else{
                    res.status(200).send({
                     mensaje : "Usuario encontrado.", 
                      permiso : 1, 
                      tipo : "paciente",
                      id : resultLogin[0].id_paciente,
                      nombreC : resultLogin[0].nombre + " " + resultLogin[0].apPaterno + " " + resultLogin[0].apMaterno,
                      imgExtension : 'png',
                      img : dataLectura
                    });
                  }
                });
              }
            }else{
              //no existe
              res.status(500).send({mensaje : "Comprueba los datos", permiso : 0});
            }
          }
        });
      }
    }
});

  //METODO PARA OBTENER TODOS LOS ARCHIVOS DE UN USUARIO PROFESIONAL Y ALMACENARLO DENTRO DE LA CARPETA DE ARCHIVOS
    //EN COMPARACIÓN CON LA VERSIÓN PASADA, AHORA ENVIA LA INFORMACIÓN DE LOS ARCHIVOS DENTRO DEL RESPONSE DE LA PETICIÓN
app.get("/obtenArchivosProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
    if(idProfesional === ""){
      console.log("Error no hay datos");
      res.status(500).send("Error");
    }else{
      const conn = conexion.cone;
      conn.query(`SELECT * FROM archivos WHERE id_profesional = ${idProfesional}`, (err, result) => {
        if(err){
            throw err;
        }else{
          //validamos que el profesional tenga archivos que obtener
          if(result.length > 0){ // realizamos la creación de los archivos
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
                    const nombreFolder = __dirname+"/archivos/archivosProfesionales/busqueda_certificados_id_"+idProfesional;
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
                              fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/${idProfesional}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                                if(err){
                                  console.log("Error escritura de archivos decodificado", err);
                                }
                              });
                              data.push({
                                nombre : result[i].nombreArchivo,
                                info : result[i].archivo //Buffer.from(result[i].archivo).toString()// esta es una prueba de funcionamiento
                              });
                            }
                            objeto.data = data;
                            res.status(200).send({mensaje : `Creación correcta de los archivos del usuario #${idProfesional} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/`, 
                                                archivos : objeto});
                          }
                        });
                      }else{
                        var objeto = {};
                        var data = [];
                        for(let i = 0; i < result.length; i++){
                          //var data = Buffer.from(result[i].archivo, 'binary');
                          //console.log(result[i].archivo.toString('base64'))
                          fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/${idProfesional}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                            if(err){
                              console.log("Error escritura de archivos decodificado", err);
                              }
                          });
                          data.push({
                            nombre : result[i].nombreArchivo,
                            info : result[i].archivo //Buffer.from(result[i].archivo).toString()// esta es una prueba de funcionamiento
                          });
                        }
                        objeto.data = data;
                        res.status(200).send({mensaje : `Creación correcta de los archivos del usuario #${idProfesional} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/`, 
                                            archivos : objeto});
                      }
                    }catch(err){
                      res.status(500).send(err);
                    }
                  }
                });
              }else{
                const nombreFolder = __dirname+"/archivos/archivosProfesionales/busqueda_certificados_id_"+idProfesional;
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
                          fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/${idProfesional}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                            if(err){
                              console.log("Error escritura de archivos decodificado", err);
                              }
                          });
                          data.push({
                            nombre : result[i].nombreArchivo,
                            info : result[i].archivo //Buffer.from(result[i].archivo).toString()// esta es una prueba de funcionamiento
                          });
                        }
                        objeto.data = data;
                        res.status(200).send({mensaje : `Creación correcta de los archivos del usuario #${idProfesional} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/`, 
                                            archivos : objeto});
                      }
                    });
                  }else{
                    var objeto = {};
                    var data = [];
                    for(let i = 0; i < result.length; i++){
                      //var data = Buffer.from(result[i].archivo, 'binary');
                      //console.log(result[i].archivo.toString('base64'))
                      fs.writeFile(`${__dirname}/archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/${idProfesional}_`+result[i].nombreArchivo, result[i].archivo, (err) => {
                        if(err){
                          console.log("Error escritura de archivos decodificado", err);
                          }
                      });
                      data.push({
                        nombre : result[i].nombreArchivo,
                        info : result[i].archivo //Buffer.from(result[i].archivo).toString()// esta es una prueba de funcionamiento
                      });
                    }
                    objeto.data = data;
                    res.status(200).send({mensaje : `Creación correcta de los archivos del usuario #${idProfesional} dentro del servidor, en la carpeta: /archivos/archivosProfesionales/busqueda_certificados_id_${idProfesional}/`, 
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
          }else{
            res.status(200).send({mensaje : "No hay archivos que correspondan al profesional"});
          }
        }
    });
    }
  
});

  //METODO PARA OBTENER LA LISTA DE TODOS LOS ARCHIVOS QUE EL PROFESIONAL HAYA SUBIDO A LA PLATAFORMA
    //SOLO FUNCIONA PARA OBTENER LA LISTA, NO PARA MOSTRARLOS
app.get("/obtenListaArchivosProfesional/:id", (req, res) => {
  const idProfesional = req.params.id;
  if(idProfesional === ""){
    console.log("No hay datos");
    res.status(500).send("Error");
  }else{
    const conn = conexion.cone;
    conn.query(`SELECT id_profesional, nombreArchivo FROM archivos WHERE id_profesional = ${idProfesional}`, (err, result) => {
      if(err){
        console.log(err);
        res.status(500).send({mensaje : err.message, codigo : err.code});
      }else if(result.length > 0){
        var objeto = {}, data = [];
        for(let i = 0; i < result.length; i++){
          data.push({
            nombreArchivo : result[i].nombreArchivo,
          });
        }
        objeto.idProfesional = result[0].id_profesional;
        objeto.archivos = data;
        res.status(200).send({objeto : objeto});
      }else{
        res.status(200).send({mensaje : "No hay archivos cargados"});
      }
    });
  }
});

  //MÉTODO DE BUSQUEDA DE MEDICIONES POR PACIENTE 
app.get("/busquedaMediciones/:id", (req, res) => {
  const idPaciente = req.params.id;
  //La busqueda se realizara mediante el identificador del paciente
  if(!idPaciente){//validamos que el contenido de la petición no este vacío
    res.status(500).send({error : "Sin información"});
  }else{
    //validamos que se cuente con el valor dentro del cuerpo de la petición
    if(idPaciente === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      //realizamos una busqueda para comprobar que hay
      conn.query(`SELECT COUNT(*) as total FROM mediciones WHERE id_paciente = ${idPaciente}`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda[0].total > 0){//contamos con mediciones
            //hacemos la busqueda
            conn.query(`SELECT * FROM mediciones WHERE id_paciente = ${idPaciente}`, (errorBMediciones, resultBMediciones) => {
              if(errorBMediciones){
                console.log(errorBMediciones);
                res.status(500).send({mensaje : errorBMediciones.message, codigo : errorBMediciones.code});
              }else{
                var obj = {}, fecha = [], peso = [], axiliar_media = [], abdominal = [], bicipital = [], muslo = [], suprailiaco = [], triceps = [], subescapular = [], toracica = [], pantorrilla = [], cintura = [];
                for(let i = 0; i < resultBMediciones.length; i++){
                  let fechaIni = new Date(resultBMediciones[i].fecha);
                  peso.push(resultBMediciones[i].peso);
                  axiliar_media.push(resultBMediciones[i].axiliar_media);
                  abdominal.push(resultBMediciones[i].abdominal);
                  bicipital.push(resultBMediciones[i].bicipital);
                  muslo.push(resultBMediciones[i].muslo);
                  suprailiaco.push(resultBMediciones[i].suprailiaco);
                  triceps.push(resultBMediciones[i].triceps);
                  subescapular.push(resultBMediciones[i].subescapular);
                  toracica.push(resultBMediciones[i].toracica);
                  pantorrilla.push(resultBMediciones[i].pantorrilla_medial);
                  cintura.push(resultBMediciones[i].cintura);
                  fecha.push(fechaIni.getUTCDate()+"-"+(fechaIni.getUTCMonth()+1)+"-"+fechaIni.getUTCFullYear());
                }
                obj = {
                  "peso" : peso,
                  "axiliar" : axiliar_media,
                  "abdominal" : abdominal,
                  "bicipital" : bicipital,
                  "muslo" : muslo,
                  "suprailiaco" : suprailiaco,
                  "triceps" : triceps,
                  "subescapular" : subescapular,
                  "toracica" : toracica,
                  "pantorrilla" : pantorrilla,
                  "cintura" : cintura, 
                  "fecha" : fecha
                };
                res.status(200).send({mensaje : "OK", objeto : obj});
                //console.log(resultBMediciones);
              }
            });
          }else{
            console.log("ERROR");
            res.status(404).send({mensaje : "No existen mediciones que mostrar"});
          }
        }
      });
    }
  }
});


  //METODOS DE ELIMINACIÓN DE ELEMENTO
    //se eliminan todos los registros relacionados con el profesional, solo se modifican los usuarios_pacientes, historial_profesionales, mediciones, alimento_dieta
    //ELIMINAR imgusuarioprofesional, archivos, videos, usuarios_profesionales, citas, proximas_citas
    //MODIFICAR usuarios_pacientes, ejercicio_rutina, alimento_dieta, historial_profesionales, mediciones   COLOCAMOS EL VALOR DE 0 DENTRO DE LA COLUMNA
      //hechos:
          /*  ELIMINADOS
            proximas_citas, citas, imgusuariosprofesionales, videos, archivos
          */
          /*  MODIFICADOS
            mediciones, alimento_dieta, ejercicio_rutina, usuarios_pacientes, historial_profesionales
            dentro de la tabla de usuariosProfesionales modificamos el valor de valido como 2 el cual se considera como registro no valido
          */
  //ULTIMA PRUEBA, ESTADO : FUNCIONAL
app.delete("/borraProfesional", (req, res) => {//obtenemos el id del profesional
  //al eleminar debemos quitar el profesional de la salud o hacer la reasignación en otro metodo 
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      var obj = {}, data = [];
      conn.query(`SELECT * FROM usuarios_profesionales WHERE id_profesional = ${req.body.id}`, (errorBusqueda, resultadoBusqueda) => {
        if(errorBusqueda){
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultadoBusqueda.length > 0){//existe
            const operaciones = [
              //valor de 1 actualizacion, 2 eliminacion
              {operacion : 2, tabla : "proximas_citas", id : req.body.id, conexion : conn},
              {operacion : 1, tabla : "mediciones", id : req.body.id, valor : 0, conexion : conn},
              {operacion : 1, tabla : "alimento_dieta", id : req.body.id, valor : 0, conexion : conn},
              {operacion : 1, tabla : "ejercicio_rutina", id : req.body.id, valor : 0, conexion : conn},
              {operacion : 1, tabla : "usuarios_pacientes", id : req.body.id, valor : 0, conexion : conn},
              {operacion : 1, tabla : "historial_profesionales", id : req.body.id, valor : 0, conexion : conn},
              {operacion : 2, tabla : "citas", id : req.body.id, conexion : conn},
              {operacion : 2, tabla : "imgUsuariosProfesionales", id : req.body.id, conexion : conn},
              {operacion : 2, tabla : "videos", id : req.body.id , conexion : conn},
              {operacion : 2, tabla : "archivos", id : req.body.id , conexion : conn},
              {operacion : 1, tabla : "usuarios_profesionales", id : req.body.id, valor : 2, conexion : conn},
            ];

            const promesasOP = operaciones.map(operacion => {
              if(operacion.operacion == 1){//actualizamos
                return actualizaRegistroProfesional(operacion.tabla, operacion.id, operacion.valor, operacion.conexion);
              }else if(operacion.operacion == 2){//borramos
                return eliminaRegistroProfesional(operacion.tabla, operacion.id, operacion.conexion);
              }
            });
            
            Promise.all(promesasOP).then(resultados => {
              const errores = resultados.filter(resultado => !resultado.exitosa).length;
              if(errores > 0){
                res.status(500).send({mensaje : "Error en las operaciones", error : errores});
              }else{
                ejemplosCorreo.eliminaUsuario(resultadoBusqueda[0].nombre, resultadoBusqueda[0].apPaterno, resultadoBusqueda[0].apMaterno, (html) =>{
                  correoEnvio.crearOpcionesCorreo(""+resultadoBusqueda[0].email, "Confirmación de Eliminación de Registro de Usuario en la Aplicación 2BFit.", html);
                  correoEnvio.enviaCorreo((objeto) => {
                    if(objeto.OK == 1){
                      res.status(200).send({mensaje : "Eliminación exitosa"});
                    }else if(objeto.OK == 0){
                      res.status(500).send({mensaje : "Error en el envio del correo, compruebe el correo"});
                    }
                  })
                });
              }
            }).catch(error => {
              console.log(error);
              res.status(500).send({mensaje : "Error en las promesas", error : error});
            });
          }else{//no existe
            res.status(404).send({mensaje : "Usuario no existente"});
          }
        }
      });
    }
  }
});

//funciones que realizan las operaciones de actualización y eliminación respectivamente
function actualizaRegistroProfesional(tabla, id, valor, conexion){
  return new Promise((resolve, reject) => {
    var query = "";
    if(tabla == "usuarios_profesionales")
      query = `UPDATE ${tabla} SET valido = ${valor} WHERE id_profesional = ${id}`;
    else if(tabla == "historial_profesionales") query = `UPDATE ${tabla} SET fechaTer = '${fechaApi}' WHERE id_profesional = ${id}`;
    else query = `UPDATE ${tabla} SET id_profesional = ${valor} WHERE id_profesional = ${id}`;
    //console.log(query);
    conexion.query(query, (error, result) => {
      if(error){
        console.log("Error al actualizar el registro: "+error.message);
        resolve({operacion : "Actualización", tabla : tabla, exitosa : false});
      }else{
        //console.log("Registro actualizado ");
        resolve({operacion : "Actualización", tabla : tabla, exitosa : true});
      }
    });
  });
}
function eliminaRegistroProfesional(tabla, id, conexion){
  return new Promise ((resolve, reject) => {
    var query = `DELETE FROM ${tabla} WHERE id_profesional = ${id}`;
    conexion.query(query, (err, result) =>{
      if(err){
        console.log("Error al eliminar el registro: "+err.message);
        resolve({operacion : "Eliminación", tabla : tabla, exitosa : false});
      }else{
        //console.log("Registro eliminado ");
        resolve({operacion : "Eliminación", tabla : tabla, exitosa : true});
      }
    });
  });
}

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

  //MÉTODO PARA ELIMINACIÓN DE MEDICION POR FECHA E IDENTIFICADOR DE PACIENTE
  //fecha AÑO MES DIA
app.delete("/eliminarMedicion", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === "" || req.body.fecha === ""){//Comprobamos que ambos valores se encuentren con valor
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      //hacemos la busqueda de que exista el elemento 
      conn.query(`SELECT * FROM mediciones WHERE id_paciente = ${req.body.id} and fecha = '${req.body.fecha}'`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda)
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            //hacemos la eliminación
            conn.query(`DELETE FROM mediciones WHERE id_paciente = ${req.body.id} and fecha = '${req.body.fecha}'`, (errorEliminar, resultEliminar) => {
              if(errorEliminar){
                console.log(errorEliminar)
                res.status(500).send({mensaje : errorEliminar.message, codigo : errorEliminar.code});
              }else{
                if(resultEliminar.affectedRows > 0){
                  //console.log(resultEliminar);
                  res.status(200).send({mensaje : "Eliminación exitosa"});
                }
              }
            });
          }
        }
      });
    }
  }
});

  //MÉTODO PARA ELIMINACIÓN DE MEDICIONES POR PACIENTE OBTENEMOS IDENTIFICADOR
app.delete("/eliminarMediciones", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      //buscamos si hay mediciones que borrar
      conn.query(`SELECT COUNT(id_paciente) as total FROM mediciones WHERE id_paciente = ${req.body.id}`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda)
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda[0].total > 0){//si se cuenta con mediciones
            //console.log(resultBusqueda)
            //res.status(200).send({mensaje : "OK valor actual"});
            conn.query(`DELETE FROM mediciones WHERE id_paciente = ${req.body.id}`, (errorBorrar, resultBorrar) =>{
              if(errorBorrar){
                console.log(errorBorrar);
                res.status(500).send({mensaje : errorBorrar.message, codigo : errorBorrar.code});
              }else{
                if(resultBorrar.affectedRows > 0){
                  res.status(200).send({mensaje : "Eliminación de mediciones de forma correcta"});
                }
              }
            });
          }else{
            res.status(404).send({mensaje : "No hay mediciones"});
          }
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
      //console.log(req.body);
      const conn = conexion.cone;
      //realizamos la actualizacion de datos
      conn.query(`UPDATE ejercicio_rutina SET cantidad = '${req.body.cantidad}', id_video = ${req.body.id_video}, id_ejercicio = ${req.body.id_ejercicio}, fechaInicio = '${req.body.fechaInicio}', fechaFin = '${req.body.fechaFin}' WHERE id_ER = ${req.body.id_ER}`, (errorActua, resultActua) => {
        if(errorActua){
          res.status(500).send({error : errorActua.message, codigo : errorActua.code});
        }else{
          res.status(200).send({mensaje : "Informacion actualizada"});
        }
      });
    }
  }
});

  //MÉTODO PARA ACTUALIZACIÓN DE MEDICIÓN, USANDO COMO VALOR LA FECHA 
app.put("/actualizaMedicion", (req, res) => {
  //obtenemos todos los valores que se obtienen de la alta, las mediciones, junto con la fecha e id del paciente
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id_profesional === "" || req.body.id_paciente === "" || req.body.peso === "" || req.body.axiliar_media === "" || req.body.abdominal === "" || req.body.bicipital === "" || req.body.muslo === "" || req.body.suprailiaco === "" || req.body.triceps === "" || req.body.subescapular === "" || req.body.toracica === "" || req.body.pantorrilla_medial === "" || req.body.cintura === "" || req.body.fecha === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      conn.query(`UPDATE mediciones SET peso = ${req.body.peso}, axiliar_media = ${req.body.axiliar_media}, abdominal = ${req.body.abdominal}, bicipital = ${req.body.bicipital}, muslo = ${req.body.muslo}, suprailiaco = ${req.body.suprailiaco}, triceps = ${req.body.triceps}, subescapular = ${req.body.subescapular}, toracica = ${req.body.toracica}, pantorrilla_medial = ${req.body.pantorrilla_medial}, cintura = ${req.body.cintura} WHERE id_profesional = ${req.body.id_profesional} and id_paciente = ${req.body.id_paciente} and fecha = '${req.body.fecha}'`, (errorActualizacion, resultActualizacion) => {
        if(errorActualizacion){
          console.log(errorActualizacion);
          res.status(500).send({mensaje : errorActualizacion.message, codigo : errorActualizacion.code})
        }else{
          if(resultActualizacion.affectedRows > 0){
            res.status(200).send("Actualización de datos correcta");
          }
        }
      });
    }
  }
});

//MÉTODO DE HABITO ALIMENTICIO Y PERSONAL ALTA BUSQUEDA ACTUALIZACION Y ELIMINACION
//habito alimenticio
/*
  id_paciente
  masConsumidos
  alimentos_alergia
  cantidad_agua
  cantidad_comidas
  cantidad_colaciones
  horaDesayuno
  horaComida
  horaCena
  */

app.post("/habitoAlimenticio/alta", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === "" || req.body.masConsumidos === "" || req.body.alimentos_alergia === "" || req.body.cantidad_agua === "" || req.body.cantidad_comidas === "" || req.body.cantidad_colaciones === "" || req.body.horaDesayuno === "" || req.body.horaComida === "" || req.body.horaCena === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      /* console.log(req.body);
      console.log(req.body.masConsumidos.length)*/
      const conn = conexion.cone;
      conn.query(`INSERT INTO habito_alimenticio VALUES (${req.body.id}, '${req.body.masConsumidos}', '${req.body.alimentos_alergia}', ${req.body.cantidad_agua}, ${req.body.cantidad_comidas}, ${req.body.cantidad_colaciones}, '${req.body.horaDesayuno}', '${req.body.horaComida}', '${req.body.horaCena}')`, (errorInsert, resultInsert) => {
        if(errorInsert){
          console.log(errorInsert);
          res.status(500).send({mensaje : errorInsert.message, codigo : errorInsert.code});
        }else{
          res.status(200).send({mensaje : "Creación de habito alimenticio existoso"});
        }
      });
    }
  }
});
      
//MÉTODO DE BUSQUEDA MEDIANTE ID DE PACIENTE
app.get("/habitoAlimenticio/obten/:id", (req, res) => {
  const idPaciente = req.params.id;
    if(!idPaciente){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      //realizamos la busqueda
      const conn = conexion.cone;
      conn.query(`SELECT * FROM habito_alimenticio WHERE id_paciente = ${idPaciente}`, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          //comprobamos que obtenemos un valor
          if(resultBusqueda.length > 0){
            //mandamos el objeto obtenido como respuesta
            res.status(200).send({mensaje : "OK", obj : resultBusqueda[0]});
          }else{
            res.status(404).send({mensaje : "Sin datos que obtener"});
          }
        }
      });
  }
});
      
//MÉTODO DE ACTUALIZACIÓN MEDIANTE ID DE PACIENTE
app.put("/habitoAlimenticio/actualiza", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === "" || req.body.masConsumidos === "" || req.body.alimentos_alergia === "" || req.body.cantidad_agua === "" || req.body.cantidad_comidas === "" || req.body.cantidad_colaciones === "" || req.body.horaDesayuno === "" || req.body.horaComida === "" || req.body.horaCena === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      //realizamos la actualización de datos
      const conn = conexion.cone;
      conn.query(`UPDATE habito_alimenticio SET masConsumidos = '${req.body.masConsumidos}', alimentos_alergia = '${req.body.alimentos_alergia}', cantidad_agua =  ${req.body.cantidad_agua}, cantidad_comidas = ${req.body.cantidad_comidas}, cantidad_colaciones = ${req.body.cantidad_colaciones}, horaDesayuno = '${req.body.horaDesayuno}', horaComida = '${req.body.horaComida}', horaCena = '${req.body.horaCena}' WHERE id_paciente = ${req.body.id}`, (errorActualiza, resultActualiza) => {
        if(errorActualiza){
          console.log(errorActualiza);
          res.status(500).send({mensaje : errorActualiza.message, codigo : errorActualiza.code});
        }else{
          if(resultActualiza.affectedRows > 0){
            res.status(200).send({mensaje : "Registro actualizado"}); 
          }
        }
      });
    }
  }
});
      
//MÉTODO DE ELIMINACIÓN MEDIANTE ID DEL PACIENTE
app.delete("/habitoAlimenticio/eliminarRegistro", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      conn.query(`DELETE FROM habito_alimenticio WHERE id_paciente = ${req.body.id}`, (errorElimina, resultadoElimina) => {
        if(errorElimina){
          console.log(errorElimina);
          res.status(500).send({mensaje : errorElimina.message, codigo : errorElimina.code});
        }else{
          if(resultadoElimina.affectedRows > 0){
            res.status(200).send({mensaje : "Eliminación del habito exitoso"});
          }
        }
      });
    }
  }
});

//habito personal 
/*
id_paciente	int horaD	time horaS	time desc_fisica	char(100) rutinaDia	char(100)
*/

//MÉTODO DE ALTA DE HABITO PERSONAL
app.post("/habitoPersonal/alta", (req, res) => {
  if(JSON.stringify(req.body) === "{}"){
    res.status(500).send({mensaje : "Sin información en la solicitud"});
  }else{
    if(req.body.id === "" || req.body.horaD === "" || req.body.horaS === "" || req.body.descFisica === "" || req.body.rutinaDia === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      //comprobamos la longitud de los elementos
      if(req.body.descFisica.length > 100 || req.body.rutinaDia > 100){
        res.status(500).send({mensaje : "No se cumple con la longitud esperada"});
      }else{
        const conn = conexion.cone;
        conn.query(`INSERT INTO habito_personal VALUES (${req.body.id}, '${req.body.horaD}', '${req.body.horaS}', '${req.body.descFisica}', '${req.body.rutinaDia}')`, (errorInsert, resultInsert) => {
          if(errorInsert){
            console.log(errorInsert);
            res.status(500).send({mensaje : errorInsert.message, codigo : errorInsert.code});
          }else{
            res.status(200).send({mensaje : "Creación de habito personal exitosa"});
          }
        });
      }
    }
  }
});
//MÉTODO DE BUSQUEDA DE HABITO PERSONAL MEDIANTE ID DEL PACIENTE
app.get("/habitoPersonal/busqueda/:id", (req, res)=>{
  const idPaciente = req.params.id;
    if(!idPaciente){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{ 
      const conn = conexion.cone;
      const query = `SELECT up.id_paciente, up.nombre, up.apPaterno, up.apMaterno, hp.horaD, hp.horaS, hp.desc_fisica, hp.rutinaDia FROM usuarios_pacientes as up, habito_personal as hp WHERE hp.id_paciente = ? and hp.id_paciente = up.id_paciente`;
      conn.query(query, (idPaciente), (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            var objeto = {};
            objeto = {
              "id" : resultBusqueda[0].id_paciente,
              "nombreC" : resultBusqueda[0].nombre + " " + resultBusqueda[0].apPaterno + " " + resultBusqueda[0].apMaterno,
              "horaD" : resultBusqueda[0].horaD,
              "horaS" : resultBusqueda[0].horaS,
              "desc_fisica" : resultBusqueda[0].desc_fisica,
              "rutinaDia" : resultBusqueda[0].rutinaDia
            }
            res.status(200).send(objeto);
          }else{
            res.status(404).send({mensaje : "Información no encontrada"});
          }
        }
      });
  }
});
//MÉTODO DE ACTUALIZACIÓN DE HABITO PERSONAL MEDIANTE ID DEL PACIENTE
app.put("/habitoPersonal/actualiza", (req, res)=>{
  if(JSON.stringify(req.body) === "{}"){
    res.status(500).send({mensaje : "Sin información en la solicitud"});
  }else{
    if(req.body.id === "" || req.body.horaD === "" || req.body.horaS === "" || req.body.descFisica === "" || req.body.rutinaDia === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      if(req.body.descFisica.length > 100 || req.body.rutinaDia.length > 100){
        res.status(500).send({mensaje : "No se cumple con la longitud esperada"});
      }else{
        const conn = conexion.cone;
        var query = 'SELECT * FROM habito_personal WHERE id_paciente = ?';
        conn.query(query, (req.body.id), (errorBusqueda, resultBusqueda) => {
          if(errorBusqueda){
            console.log(errorBusqueda);
            res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
          }else{
            if(resultBusqueda.length > 0){
              //hacemos la actualización 
              let actualizaQuery = 'UPDATE habito_personal SET horaD = ?, horaS = ?, desc_fisica = ?, rutinaDia = ? WHERE id_paciente = ?';
              conn.query(actualizaQuery, [req.body.horaD, req.body.horaS, req.body.descFisica, req.body.rutinaDia, req.body.id], (errorActualiza, resultActualiza) => {
                if(errorActualiza){
                  console.log("actualiza", errorActualiza);
                  res.status(500).send({mensaje : errorActualiza.message, codigo : errorActualiza.code});
                }else{
                  if(resultActualiza.affectedRows > 0){
                    res.status(200).send({mensaje : "Registro actualizado"});
                  }
                }
              });
            }else{
              res.status(404).send({mensaje : "No se encuentra el usuario"});
            }
          }
        });
      }
    }
  }
});
//MÉTODO DE ELIMINACIÓN DE HABITO PERSONAL MEDIANTE ID DEL PACIENTE
app.delete("/habitoPersonal/elimina", (req, res)=>{
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información en la solicitud"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      const query = "DELETE FROM habito_personal WHERE id_paciente = ?";
      conn.query(query, req.body.id, (errorEliminar, resultEliminar)=>{
        if(errorEliminar){
          console.log(errorEliminar);
          res.status(500).send({mensaje : errorEliminar.message, codigo : errorEliminar.code});
        }else{
          if(resultEliminar.affectedRows > 0){
            res.status(200).send({mensaje : "Registro de habito personal eliminado de forma exitosa"});
          }
        }
      });
    }
  }
});

//informacion médica de pacientes
//campos a considerar
/*
id_paciente	int, estatura	float, ocupacion	char(50), imc	float, objetivo	char(100), 
alergias	char(150), medicamentosC	char(150), enferm	char(100), enfermFam	char(100)
DENTRO DE enferm Y enferFam OBTENDREMOS UN ARREGLO CON TODOS LOS ID QUE CORRESPONDEN A CADA ENFERMEDADE
  */
//MÉTODO DE ALTA DE INFORMACIÓN MÉDICA
app.post("/infoMed/alta", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información en la solicitud"});
  }else{
    if(req.body.id_paciente === "" || req.body.estatura === "" || req.body.ocupacion === "" || req.body.imc === "" ||
    req.body.objetivo === "" || req.body.alergias === "" || req.body.medicamentosC === "" || Array.isArray(req.body.enferm) === false || 
    Array.isArray(req.body.enfermFam) === false ){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let query = `INSERT INTO infompaciente VALUES (?,?,?,?,?,?,?,?,?)`;
      //console.log(typeof(req.body.enfermFam.toString()));
      conn.query(query, [req.body.id_paciente, req.body.estatura, req.body.ocupacion, req.body.imc, req.body.objetivo, req.body.alergias, req.body.medicamentosC, req.body.enferm.toString(), req.body.enfermFam.toString()], (errorInsert, resultInsert) => {
        if(errorInsert){
          console.log(errorInsert);
          res.status(500).send({mensaje : errorInsert.message, codigo : errorInsert.code});
        }else{
          res.status(200).send({mensaje : "Creación exitosa"});
        }
      });
    }
  }
});

//MÉTODO DE BUSQUEDA DE INFORMACIÓN MÉDICA MEDIANTE ID DEL PACIENTE
app.get("/infoMed/obten/:id", (req, res) => {
  const idPaciente = req.params.id;
    if(!idPaciente){
      req.body(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      const queryBusqueda = "SELECT up.id_paciente, up.nombre, up.apPaterno, up.apMaterno, infoM.estatura, infoM.ocupacion, infoM.imc, infoM.objetivo, infoM.alergias, infoM.medicamentosC, infoM.enferm, infoM.enfermFam FROM infompaciente as infoM, usuarios_pacientes as up WHERE infoM.id_paciente = ? and up.id_paciente = infoM.id_paciente";
      conn.query(queryBusqueda, idPaciente, (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            var objeto = {};
            let cantEnferm = resultBusqueda[0].enferm.split(','), cantEnfermFam = resultBusqueda[0].enfermFam.split(',');
            const catalogoEnfermedades = [];
            //creamos el objeto de salida
            objeto = {
              id_paciente : resultBusqueda[0].id_paciente,
              nombreC : resultBusqueda[0].nombre + " " + resultBusqueda[0].apPaterno + " " + resultBusqueda[0].apMaterno,
              estatura : resultBusqueda[0].estatura,
              ocupacion : resultBusqueda[0].ocupacion,
              imc : resultBusqueda[0].imc,
              objetivo : resultBusqueda[0].objetivo,
              alergias : resultBusqueda[0].alergias,
              medicamentosC : resultBusqueda[0].medicamentosC, 
              idEnfermedades : resultBusqueda[0].enferm,
              idEnfermedadesFam : resultBusqueda[0].enfermFam
            };
            if(cantEnferm.length > 0){
              for(let i = 0; i < cantEnferm.length; i++)
                catalogoEnfermedades.push({id : cantEnferm[i], conexion : conn, tipo : "pacientes"});
            }else{
              objeto.enferm = "No aplica";
            }
            
            if(cantEnfermFam.length > 0){
              for(let i = 0; i < cantEnfermFam.length; i++)
                catalogoEnfermedades.push({id : cantEnfermFam[i], conexion : conn, tipo : "familiar"});
            }else{
              objeto.enfermFam = "No aplica";
            }
            if(catalogoEnfermedades.length > 0){
              let enfermedadesPaciente = [], enfermedadesFam = [];
              const promesasCatalogo = catalogoEnfermedades.map(operacion => {
                return obtenEnfermedades(operacion.id, operacion.conexion, operacion.tipo);
              });
              Promise.all(promesasCatalogo).then(resultados => {

                for(let i = 0; i < resultados.length; i++){
                  if(resultados[i].tipo == "pacientes")
                    enfermedadesPaciente.push(resultados[i].data);
                  else if(resultados[i].tipo == "familiar")
                    enfermedadesFam.push(resultados[i].data);
                }

                if(enfermedadesPaciente.length > 0 && enfermedadesPaciente[0] != undefined){
                  objeto.enferm = enfermedadesPaciente;
                }else{
                  objeto.enferm = "No aplica";
                }

                if(enfermedadesFam.length > 0 && enfermedadesFam[0] != undefined){
                  objeto.enfermFam = enfermedadesFam;
                }else{
                  objeto.enfermFam = "No aplica";
                }

                //ENVIAMOS EL OBJETO
                res.status(200).send({mensaje : "OK", objeto : objeto});
                
              }).catch(error => {
                res.status(500).send({mensaje : "Error dentro de las promesas", error : error});
              });
            }else{
              res.status(200).send({mensaje : "OK", objeto : objeto});
            }
          }else{
            res.status(404).send({mensaje : "No hay registro"});
          }
        }
      });
    }
});

function obtenEnfermedades(id, conexion, tipo){
  return new Promise ((resolve, reject) => {
    var query = `SELECT * FROM c_enfermedades WHERE id_enfermedad = ${id}`;
    conexion.query(query, (err, result) =>{
      if(err){
        resolve({operacion : "Busqueda", exitosa : false, tipo : tipo});
      }else{
        //console.log("Registro eliminado ");
        resolve({operacion : "Busqueda", exitosa : true, data : result[0].descripcion, tipo : tipo});
      }
    });
  });
}

//MÉTODO DE ACTUALIZACIÓN DE INFORMACIÓN MÉDICA 
app.put("/infoMed/actualiza", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información en la solicitud"});
  }else{
    if(req.body.id_paciente === "" || req.body.estatura === "" || req.body.ocupacion === "" || req.body.imc === "" ||
    req.body.objetivo === "" || req.body.alergias === "" || req.body.medicamentosC === "" || Array.isArray(req.body.enferm) === false || 
    Array.isArray(req.body.enfermFam) === false ){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let query = "UPDATE infompaciente SET estatura = ?, ocupacion = ?, imc = ?, objetivo=?, alergias=?, medicamentosC=?, enferm=?, enfermFam=? WHERE id_paciente = ?";
      conn.query(query, [req.body.estatura, req.body.ocupacion, req.body.imc, req.body.objetivo, req.body.alergias, req.body.medicamentosC, req.body.enferm.toString(), req.body.enfermFam.toString(), req.body.id_paciente], (errorActualiza, resultActualiza) => {
        if(errorActualiza){
          console.log(errorActualiza);
          res.status(500).send({mensaje : errorActualiza.message, codigo : errorActualiza.code});
        }else{
          if(resultActualiza.affectedRows > 0){
            res.status(200).send({mensaje : "Actualización exitosa"});
          }
        }
      });
    }
  }
});

//MÉTODO DE ELIMINACIÓN DE INFORMACIÓN MÉDICA
app.delete("/infoMed/eliminar", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información en la solicitud"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let busqueda = `SELECT * FROM infompaciente WHERE id_paciente = ?`;
      conn.query(busqueda, [req.body.id], (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            let eliminaQuery = `DELETE FROM infompaciente WHERE id_paciente = ?`;
            conn.query(eliminaQuery, [req.body.id], (errorElimina, resultElimina) => {
              if(errorElimina){
                console.log(errorElimina);
                res.status(500).send({mensaje : errorElimina.message, code : errorElimina.code});
              }else{
                if(resultElimina.affectedRows > 0){
                  res.status(200).send({mensaje : "Registro de información médica eliminada"});
                }
              }
            });
          }else{
            res.status(404).send({mensaje : "No se encontro un registro"});
          }
        }
      });
    }
  }
});

//alimento dieta
/*
id_profesional	int, id_paciente	int, id_comida	int, proteinas	char(100),
cantidades_proteinas	char(150), lacteos	char(100), cantidades_lacteos	char(150),
frutas	char(100), cantidades_frutas	char(150), verduras	char(100), cantidades_verduras	char(150),
granos	char(100), cantidades_granos	char(150), duracion	int, vigencia	char(1)
*/
//MÉTODO DE ALTA DE ALIMENTO DIETA
app.post("/alimentodieta/alta", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información en la solicitud"});
  }else{
    if(req.body.idProfesional === "" || req.body.idPaciente === "" || req.body.idComida === "" ||
    Array.isArray(req.body.proteinas) === false || Array.isArray(req.body.cantidadesProteinas) === false ||
    Array.isArray(req.body.lacteos) === false || Array.isArray(req.body.cantidadesLacteos) === false ||
    Array.isArray(req.body.frutas) === false || Array.isArray(req.body.cantidadesFrutas) === false ||
    Array.isArray(req.body.verduras) === false || Array.isArray(req.body.cantidadesVerduras) === false ||
    Array.isArray(req.body.granos) === false || Array.isArray(req.body.cantidadesGranos) === false ||
    req.body.duracion === "" || req.body.vigencia === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let queryAlta = `INSERT INTO alimento_dieta VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      conn.query(queryAlta, [req.body.idProfesional, req.body.idPaciente, req.body.idComida, req.body.proteinas.toString(), req.body.cantidadesProteinas.toString(), req.body.lacteos.toString(), req.body.cantidadesLacteos.toString(), req.body.frutas.toString(), req.body.cantidadesFrutas.toString(), req.body.verduras.toString(), req.body.cantidadesVerduras.toString(), req.body.granos.toString(), req.body.cantidadesGranos.toString(), req.body.duracion, req.body.vigencia], (errorAlta, resultAlta) => {
        if(errorAlta){
          console.log(errorAlta);
          res.status(500).send({mensaje : errorAlta.message, code : errorAlta.code});
        }else{
          res.status(200).send({mensaje : "Creación exitosa"});
        }
      });
    }
  }
});
//MÉTODO DE OBTENCIÓN DE ALIMENTO DIETA
//busqueda de lista alimentos de dietas vigentes mediante id del paciente (caso para los profesionales y pacientes)
app.get("/alimentodieta/busqueda/paciente/:id", (req, res) =>{
  const idPaciente = req.params.id;
    if(!idPaciente){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let query = `SELECT ad.id_profesional, ad.id_paciente, ad.id_comida, ad.proteinas, ad.cantidades_proteinas, ad.lacteos, ad.cantidades_lacteos, ad.frutas, ad.cantidades_frutas, ad.verduras, ad.cantidades_verduras, ad.granos, ad.cantidades_granos, ad.duracion, ad.vigencia , tc.descripcion, up.nombre, up.apPaterno, up.apMaterno FROM alimento_dieta as ad, tipoComida as tc, usuarios_pacientes as up WHERE ad.id_paciente = ? and ad.vigencia = 1 AND ad.id_comida = tc.id_comida AND ad.id_paciente = up.id_paciente`;
      conn.query(query, [idPaciente], (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            var objeto = {}, data = [];
            objeto = {
              id_profesional : resultBusqueda[0].id_profesional,
              id_paciente : resultBusqueda[0].id_paciente,
              nombreCpaciente : resultBusqueda[0].nombre + " " + resultBusqueda[0].apPaterno + " " + resultBusqueda[0].apMaterno
            };

            for(let i = 0; i <= resultBusqueda.length; i++){
              if(i < resultBusqueda.length){
                let idProteinas =  resultBusqueda[i].proteinas.split(',');
                let idLacteos = resultBusqueda[i].lacteos.split(',');
                let idFrutas = resultBusqueda[i].frutas.split(',');
                let idVerduras = resultBusqueda[i].verduras.split(',');
                let idGranos = resultBusqueda[i].granos.split(',');
                const arregloPromesas = [];
                //realizaremos las promesas para el caso de obtener
                  //tipo de comida, descripcion de cada elemento de las comidas
                
                if(idProteinas.length > 0){
                  for(let j = 0; j < idProteinas.length; j++)
                    arregloPromesas.push({id : idProteinas[j], conexion : conn, tipo : "proteinas"});
                }
                if(idLacteos.length > 0){
                  for(let j = 0; j < idLacteos.length; j++)
                    arregloPromesas.push({id : idLacteos[j], conexion : conn, tipo : "lacteos"});
                }
                if(idFrutas.length > 0){
                  for(let j = 0; j < idFrutas.length; j++)
                    arregloPromesas.push({id : idFrutas[j], conexion : conn, tipo : "frutas"});
                }
                if(idVerduras.length > 0){
                  for(let j = 0; j < idVerduras.length; j++)
                    arregloPromesas.push({id : idVerduras[j], conexion : conn, tipo : "verduras"});
                }
                if(idGranos.length > 0){
                  for(let j = 0; j < idGranos.length; j++)
                    arregloPromesas.push({id : idGranos[j], conexion : conn, tipo : "granos"});
                }
                
                if(arregloPromesas.length > 0){
                  const promesasDescripcion = arregloPromesas.map(operacion => {
                    return obtenDescripcionAlimento(operacion.id, operacion.conexion, operacion.tipo);
                  });
                  creaJSONDescripcionAlimento(promesasDescripcion, resultBusqueda, i, idProteinas, idLacteos, idFrutas, idVerduras, idGranos).then(
                    objetod => {
                      
                      if(contadorOBJ == resultBusqueda.length){
                        //console.log(objetod)
                        for(let j =0 ; j < objetod.length; j++){
                          data.push({
                            tipoComida : objetod[j].tipoComida,
                            idTipo : objetod[j].idTipo,
                            comida : objetod[j].data
                          });
                        }
                        contadorOBJ = 0;
                        objetoG = {};
                        dataG = [];
                        objeto.comidas = data;
                        //console.log(objeto);
                        res.status(200).send({mensaje : "Obtención de información correcta", objeto : objeto});
                      }
                  }).catch(error => {
                    console.log(error);
                  });
                }
              }
            }
          }else{
            res.status(404).send({mensaje : "No se encontro registros"});
          }
        }
      });
    }
});

function obtenDescripcionAlimento(id, conexion, tipo){
  return new Promise((resolve, reject) => {
    var query = "";
    if(tipo == "proteinas")
      query = "SELECT * FROM proteinas WHERE id_proteinas = ?";
    else if(tipo == "lacteos")
      query = "SELECT * FROM lacteos WHERE id_lacteos = ?";
    else if(tipo == "frutas")
      query = "SELECT * FROM frutas WHERE id_frutas = ?";
    else if(tipo == "verduras")
      query = "SELECT * FROM verduras WHERE id_verduras = ?";
    else if(tipo == "granos")
      query = "SELECT * FROM granos WHERE id_granos = ?";
    conexion.query(query, [id], (error, result) => {
      if(error){
        resolve({tabla : tipo, exito : false, operacion : "Busqueda"});
      }else{
        resolve({tabla : tipo, exito : true, data : result[0].descripcion, operacion : "Busqueda"});
      }
    });
  });
}

var contadorOBJ = 0;
var objetoG = {}, dataG = [];
function creaJSONDescripcionAlimento(promesasDescripcion, resultBusqueda, i, idProteinas, idLacteos, idFrutas, idVerduras, idGranos){
  return Promise.all(promesasDescripcion).then(resultados => {
    var objeto = {}, data = [];
    var proteinas = [], lacteos = [], frutas = [], verduras = [], granos = [];
    for(let j = 0; j < resultados.length; j++){
      //console.log(resultados[j]);
      if(resultados[j].tabla == "proteinas")
        proteinas.push(resultados[j].data);
      else if(resultados[j].tabla == "lacteos")
        lacteos.push(resultados[j].data);
      else if(resultados[j].tabla == "frutas")
        frutas.push(resultados[j].data);
      else if(resultados[j].tabla == "verduras")
        verduras.push(resultados[j].data);
      else if(resultados[j].tabla == "granos")
        granos.push(resultados[j].data);
    }
    objeto.tipoComida = resultBusqueda[i].descripcion;
    objeto.idTipo = resultBusqueda[i].id_comida;
    data.push({
      idProteinas : idProteinas.toString(),
      proteinas : proteinas.toString(),
      cantidadesProteinas : resultBusqueda[i].cantidades_proteinas,
      idLacteos : idLacteos.toString(),
      lacteos : lacteos.toString(),
      cantidadesLacteos : resultBusqueda[i].cantidades_lacteos,
      idFrutas : idFrutas.toString(),
      frutas : frutas.toString(), 
      cantidadesFrutas : resultBusqueda[i].cantidades_frutas ,
      idVerduras : idVerduras.toString(),
      verduras : verduras.toString(),
      cantidadesVerduras : resultBusqueda[i].cantidades_verduras,
      idGranos : idGranos.toString(),
      granos : granos.toString(),
      cantidadesGranos : resultBusqueda[i].cantidades_granos,
      duracion : resultBusqueda[i].duracion
    });
    
    objeto.data = data;
    dataG.push(objeto);
    contadorOBJ++;
    objetoG = {contador : contadorOBJ, data : data};
    if(contadorOBJ == resultBusqueda.length){
      //console.log(objetoG)
      return dataG;
    }else{
      return objetoG;
    }
    //console.log(data)
  });
}

//busqueda de lista de dietas que el profesional haya creado, esto para tener un orden de que aliemento se creo para que paciente
//solo será informativa   obtenemos el id del profesional
app.get("/alimentodieta/busqueda/comidas/profesional/:id", (req, res) => {
  const idProfesional = req.params.id;
    if(!idProfesional){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let queryBusqueda = "SELECT ad.id_profesional, ad.id_paciente, ad.id_comida, ad.duracion, ad.vigencia , tc.descripcion, up.nombre, up.apPaterno, up.apMaterno FROM alimento_dieta as ad, tipoComida as tc, usuarios_pacientes as up WHERE ad.id_profesional = ? AND ad.id_comida = tc.id_comida AND ad.id_paciente = up.id_paciente";
      conn.query(queryBusqueda, [idProfesional], (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            var objeto = {}, data = [];
            for(let i = 0; i < resultBusqueda.length; i++){
              data.push({
                idProfesional : resultBusqueda[i].id_profesional,
                idPaciente : resultBusqueda[i].id_paciente,
                nombreC : resultBusqueda[i].nombre + " " + resultBusqueda[i].apPaterno + " " + resultBusqueda[i].apMaterno,
                idComida : resultBusqueda[i].id_comida,
                comida : resultBusqueda[i].descripcion,
                duracion : resultBusqueda[i].duracion,
                vigencia : resultBusqueda[i].vigencia
              });
            }
            objeto.data = data;
            res.status(200).send({mensaje : "Ok", objeto : objeto});
          }else{
            res.status(404).send({mensaje : "No se cuentan con registros"});
          }
        }
      });
    }
});

//busqueda de lista de alimentos mediante id del paciente (Solo muestra que paciente tiene aliemntos)
//solo será informativa
app.get("/alimentodieta/busqueda/comidas/paciente/:id", (req, res) => {
  const idPaciente = req.params.id;
    if(!idPaciente){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let queryBusqueda = "SELECT ad.id_profesional, ad.id_paciente, ad.id_comida, ad.duracion, ad.vigencia , tc.descripcion FROM alimento_dieta as ad, tipoComida as tc WHERE ad.id_paciente = ? AND ad.id_comida = tc.id_comida";
      conn.query(queryBusqueda, [idPaciente], (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            var objeto = {}, data = [];
            for(let i = 0; i < resultBusqueda.length; i++){
              data.push({
                idProfesional : resultBusqueda[i].id_profesional,
                idPaciente : resultBusqueda[i].id_paciente,
                idComida : resultBusqueda[i].id_comida,
                comida : resultBusqueda[i].descripcion,
                duracion : resultBusqueda[i].duracion,
                vigencia : resultBusqueda[i].vigencia
              });
            }
            objeto.data = data;
            res.status(200).send({mensaje : "Ok", objeto : objeto});
          }else{
            res.status(404).send({mensaje : "No se cuentan con registros"});
          }
        }
      });
    }
});

//busqueda de aliemtno de comida mediante el id del paciente, vigencia y tipo de comida
app.get("/alimentodieta/busqueda/comidas/tipo/:idPaciente/:idComida", (req, res) =>{
  const idPaciente = req.params.idPaciente;
  const idComida = req.params.idComida;
    if(!idPaciente || !idComida){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let query = `SELECT ad.id_profesional, ad.id_paciente, ad.id_comida, ad.proteinas, ad.cantidades_proteinas, ad.lacteos, ad.cantidades_lacteos, ad.frutas, ad.cantidades_frutas, ad.verduras, ad.cantidades_verduras, ad.granos, ad.cantidades_granos, ad.duracion, ad.vigencia , tc.descripcion, up.nombre, up.apPaterno, up.apMaterno FROM alimento_dieta as ad, tipoComida as tc, usuarios_pacientes as up WHERE ad.id_paciente = ? and ad.vigencia = 1 AND ad.id_comida = ? AND ad.id_comida = tc.id_comida AND ad.id_paciente = up.id_paciente`;
      conn.query(query, [idPaciente, idComida], (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            var objeto = {}, data = [];
            objeto = {
              id_profesional : resultBusqueda[0].id_profesional,
              id_paciente : resultBusqueda[0].id_paciente,
              nombreCpaciente : resultBusqueda[0].nombre + " " + resultBusqueda[0].apPaterno + " " + resultBusqueda[0].apMaterno
            };

            for(let i = 0; i <= resultBusqueda.length; i++){
              if(i < resultBusqueda.length){
                let idProteinas =  resultBusqueda[i].proteinas.split(',');
                let idLacteos = resultBusqueda[i].lacteos.split(',');
                let idFrutas = resultBusqueda[i].frutas.split(',');
                let idVerduras = resultBusqueda[i].verduras.split(',');
                let idGranos = resultBusqueda[i].granos.split(',');
                const arregloPromesas = [];
                //realizaremos las promesas para el caso de obtener
                  //tipo de comida, descripcion de cada elemento de las comidas
                
                if(idProteinas.length > 0){
                  for(let j = 0; j < idProteinas.length; j++)
                    arregloPromesas.push({id : idProteinas[j], conexion : conn, tipo : "proteinas"});
                }
                if(idLacteos.length > 0){
                  for(let j = 0; j < idLacteos.length; j++)
                    arregloPromesas.push({id : idLacteos[j], conexion : conn, tipo : "lacteos"});
                }
                if(idFrutas.length > 0){
                  for(let j = 0; j < idFrutas.length; j++)
                    arregloPromesas.push({id : idFrutas[j], conexion : conn, tipo : "frutas"});
                }
                if(idVerduras.length > 0){
                  for(let j = 0; j < idVerduras.length; j++)
                    arregloPromesas.push({id : idVerduras[j], conexion : conn, tipo : "verduras"});
                }
                if(idGranos.length > 0){
                  for(let j = 0; j < idGranos.length; j++)
                    arregloPromesas.push({id : idGranos[j], conexion : conn, tipo : "granos"});
                }
                
                if(arregloPromesas.length > 0){
                  const promesasDescripcion = arregloPromesas.map(operacion => {
                    return obtenDescripcionAlimento(operacion.id, operacion.conexion, operacion.tipo);
                  });
                  creaJSONDescripcionAlimento(promesasDescripcion, resultBusqueda, i, idProteinas, idLacteos, idFrutas, idVerduras, idGranos).then(
                    objetod => {
                      
                      if(contadorOBJ == resultBusqueda.length){
                        //console.log(objetod)
                        for(let j =0 ; j < objetod.length; j++){
                          data.push({
                            tipoComida : objetod[j].tipoComida,
                            idTipo : objetod[j].idTipo,
                            comida : objetod[j].data
                          });
                        }
                        contadorOBJ = 0;
                        objetoG = {};
                        dataG = [];
                        objeto.comidas = data;
                        //console.log(objeto);
                        res.status(200).send({mensaje : "Obtención de información correcta", objeto : objeto});
                      }
                  }).catch(error => {
                    console.log(error);
                  });
                }
              }
            }
          }else{
            res.status(404).send({mensaje : "No se encontro registros"});
          }
        }
      });
  }
});

//MÉTODO DE ACTUALIZACIÓN DE ALIMENTO DIETA
  //obtenemos el id del paciente y profesional, junto con el id del tipo de comida, estos datos no se modifican
  //solo modificamos los elmentos de cantidades e id de los alimentos
app.put("/alimentodieta/actualiza", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.idProfesional === "" || req.body.idPaciente === "" || req.body.idComida === "" || 
    Array.isArray(req.body.proteinas) === false || Array.isArray(req.body.cantidadesProteinas) === false ||
    Array.isArray(req.body.lacteos) === false || Array.isArray(req.body.cantidadesLacteos) === false ||
    Array.isArray(req.body.frutas) === false || Array.isArray(req.body.cantidadesFrutas) === false ||
    Array.isArray(req.body.verduras) === false || Array.isArray(req.body.cantidadesVerduras) === false ||
    Array.isArray(req.body.granos) === false || Array.isArray(req.body.cantidadesGranos) === false ||
    req.body.duracion === "" || req.body.vigencia === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let query = "UPDATE alimento_dieta SET proteinas = ?, cantidades_proteinas = ?, lacteos = ?, cantidades_lacteos = ?, frutas = ?, cantidades_frutas = ?, verduras = ?, cantidades_frutas = ?, granos = ?, cantidades_granos = ?, duracion = ?, vigencia = ? WHERE id_profesional = ? AND id_paciente = ? AND id_comida = ?";
      conn.query(query, [
        req.body.proteinas.toString(),req.body.cantidadesProteinas.toString(),req.body.lacteos.toString(),req.body.cantidadesLacteos.toString(),req.body.frutas.toString(),req.body.cantidadesFrutas.toString(),req.body.verduras.toString(),req.body.cantidadesVerduras.toString(),req.body.granos.toString(),req.body.cantidadesGranos.toString(), req.body.duracion, req.body.vigencia, req.body.idProfesional, req.body.idPaciente, req.body.idComida], 
        (errorActualizacion, resultActualizacion) => {
          if(errorActualizacion){
            console.log(errorActualizacion);
            res.status(500).send({mensaje : errorActualizacion.message, codigo : errorActualizacion.code});
          }else{
            if(resultActualizacion.affectedRows > 0){
              res.status(200).send({mensaje : "Información actualizada"});
            }
          }
        });
    }
  }
});
//MÉTODO DE ELIMINACIÓN DE ALIMENTO DIETA
//obtenemos el id del profesional, paceinte y del tipo de comida a eliminar
app.delete("/alimentodieta/eliminar", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.idProfesional === "" || req.body.idPaciente === "" || req.body.tipoComida === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let query = `DELETE FROM alimento_dieta WHERE id_profesional = ? AND id_paciente = ? AND id_comida = ?`;
      conn.query(query, [req.body.idProfesional, req.body.idPaciente, req.body.tipoComida], (errorElimina, resultElimina) => {
        if(errorElimina){
          console.log(errorElimina);
          res.status(500).send({mensaje : errorElimina.message, codigo : errorElimina.code});
        }else{
          if(resultElimina.affectedRows > 0){
            res.status(200).send({mensaje : "Registro eliminado"});
          }
        }
      })
    }
  }
});


//METODOS DE OBTENCIÓN DE PROTEINAS, LACTEOS, FRUTAS, VERDURAS Y GRANOS
//de forma general
//proteinas
app.get("/proteinas/obten", (req, res) => {
  const conn = conexion.cone;
  var objeto = {}, data = [];
  let query = "SELECT * FROM proteinas";
  conn.query(query, (errorBusqueda, resultBusqueda) => {
    if(errorBusqueda){
      console.log(errorBusqueda);
      res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
    }else if(resultBusqueda.length > 0){
      for(let i = 0; i < resultBusqueda.length; i++){
        data.push({
          id : resultBusqueda[i].id_proteinas,
          descripcion : resultBusqueda[i].descripcion
        });
      }
      objeto.proteinas = data;
      res.status(200).send({mensaje : "Obtención exitosa", objeto : objeto});
    }else if(resultBusqueda.length <= 0){
      res.status(404).send({mensaje : "No hay registros que obtener"});
    }
  });
});
//lacteos
app.get("/lacteos/obten", (req, res) => {
  const conn = conexion.cone;
  var objeto = {}, data = [];
  let query = "SELECT * FROM lacteos";
  conn.query(query, (errorBusqueda, resultBusqueda) => {
    if(errorBusqueda){
      console.log(errorBusqueda);
      res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
    }else if(resultBusqueda.length > 0){
      for(let i = 0; i < resultBusqueda.length; i++){
        data.push({
          id : resultBusqueda[i].id_lacteos,
          descripcion : resultBusqueda[i].descripcion
        });
      }
      objeto.lacteos = data;
      res.status(200).send({mensaje : "Obtención exitosa", objeto : objeto});
    }else if(resultBusqueda.length <= 0){
      res.status(404).send({mensaje : "No hay registros que obtener"});
    }
  });
});
//frutas
app.get("/frutas/obten", (req, res) => {
  const conn = conexion.cone;
  var objeto = {}, data = [];
  let query = "SELECT * FROM frutas";
  conn.query(query, (errorBusqueda, resultBusqueda) => {
    if(errorBusqueda){
      console.log(errorBusqueda);
      res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
    }else if(resultBusqueda.length > 0){
      for(let i = 0; i < resultBusqueda.length; i++){
        data.push({
          id : resultBusqueda[i].id_frutas,
          descripcion : resultBusqueda[i].descripcion
        });
      }
      objeto.frutas = data;
      res.status(200).send({mensaje : "Obtención exitosa", objeto : objeto});
    }else if(resultBusqueda.length <= 0){
      res.status(404).send({mensaje : "No hay registros que obtener"});
    }
  });
});
//verduras
app.get("/verduras/obten", (req, res) => {
  const conn = conexion.cone;
  var objeto = {}, data = [];
  let query = "SELECT * FROM verduras";
  conn.query(query, (errorBusqueda, resultBusqueda) => {
    if(errorBusqueda){
      console.log(errorBusqueda);
      res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
    }else if(resultBusqueda.length > 0){
      for(let i = 0; i < resultBusqueda.length; i++){
        data.push({
          id : resultBusqueda[i].id_verduras,
          descripcion : resultBusqueda[i].descripcion
        });
      }
      objeto.verduras = data;
      res.status(200).send({mensaje : "Obtención exitosa", objeto : objeto});
    }else if(resultBusqueda.length <= 0){
      res.status(404).send({mensaje : "No hay registros que obtener"});
    }
  });
});
//granos
app.get("/granos/obten", (req, res) => {
  const conn = conexion.cone;
  var objeto = {}, data = [];
  let query = "SELECT * FROM granos";
  conn.query(query, (errorBusqueda, resultBusqueda) => {
    if(errorBusqueda){
      console.log(errorBusqueda);
      res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
    }else if(resultBusqueda.length > 0){
      for(let i = 0; i < resultBusqueda.length; i++){
        data.push({
          id : resultBusqueda[i].id_granos,
          descripcion : resultBusqueda[i].descripcion
        });
      }
      objeto.granos = data;
      res.status(200).send({mensaje : "Obtención exitosa", objeto : objeto});
    }else if(resultBusqueda.length <= 0){
      res.status(404).send({mensaje : "No hay registros que obtener"});
    }
  });
});

//forma conjunta
app.get("/obtenAlimentos", (req, res) => {
  const conn = conexion.cone;
  var objeto = {}, proteinas = [], lacteos = [], frutas = [], verduras = [], granos = [], tipoComida = [];
  const operaciones = [
    {tabla : "proteinas", conexion : conn},
    {tabla : "lacteos", conexion : conn},
    {tabla : "frutas", conexion : conn},
    {tabla : "verduras", conexion : conn},
    {tabla : "granos", conexion : conn},
    {tabla : "tipoComida", conexion : conn}
  ];
  const promesasAlimentos = operaciones.map(operacion => {
    return busquedaTabla(operacion.tabla, operacion.conexion);
  });
  Promise.all(promesasAlimentos).then(resultados => {
    for(let i = 0; i < resultados.length; i++){
      if(resultados[i].tabla == "proteinas"){
        for(let j = 0; j < resultados[i].data.length; j++){
          proteinas.push({"id" : resultados[i].data[j].id_proteinas, "descripcion" : resultados[i].data[j].descripcion});
        }
      }else if(resultados[i].tabla == "lacteos"){
        for(let j = 0; j < resultados[i].data.length; j++){
          lacteos.push({"id" : resultados[i].data[j].id_lacteos, "descripcion" : resultados[i].data[j].descripcion});
        }
      }else if(resultados[i].tabla == "frutas"){
        for(let j = 0; j < resultados[i].data.length; j++){
          frutas.push({"id" : resultados[i].data[j].id_frutas, "descripcion" : resultados[i].data[j].descripcion});
        }
      }else if(resultados[i].tabla == "verduras"){
        for(let j = 0; j < resultados[i].data.length; j++){
          verduras.push({"id" : resultados[i].data[j].id_verduras, "descripcion" : resultados[i].data[j].descripcion});
        }
      }else if(resultados[i].tabla == "granos"){
        for(let j = 0; j < resultados[i].data.length; j++){
          granos.push({"id" : resultados[i].data[j].id_granos, "descripcion" : resultados[i].data[j].descripcion});
        }
      }else if(resultados[i].tabla == "tipoComida"){
        for(let j = 0; j < resultados[i].data.length; j++){
          tipoComida.push({"id" : resultados[i].data[j].id_comida, "descripcion" : resultados[i].data[j].descripcion});
        }
      }
    }
    objeto.tiposComida = tipoComida;
    objeto.proteinas = proteinas;
    objeto.lacteos = lacteos;
    objeto.frutas = frutas;
    objeto.verduras = verduras;
    objeto.granos = granos;
    res.status(200).send({mensaje :"Obtención de forma exitosa la información", objeto : objeto});
  }).catch(error => {
    res.status(500).send({mensaje: "Error dentro de las promesas de los alimentos", error : error});
  });
});

function busquedaTabla(tabla, conexion){
  return new Promise((resolve, reject) => {
    var query = `SELECT * FROM ${tabla}`;
    conexion.query(query, (errorBusqueda, resultadoBusqueda) => {
      if(errorBusqueda){
        resolve({operacion : "Busqueda", exitosa : false});
      }else{
        resolve({operacion : "Busqueda", exitosa : true, data : resultadoBusqueda, tabla : tabla});
      }
    });
  });
}

//MÉTODO DE ELIMINACIÓN DE PACIENTE
//tablas a eliminar 
/*
alimento_dieta
mediciones
proximas_citas
usuarios_pacientes
historial_profesionales
citas
habito_personal
habito_alimenticio
imgUsuariosPacientes
infoMpaciente
ejercicio_rutina
 */
app.delete("/borraPaciente", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.idPaciente === "" || !req.body.hasOwnProperty("idPaciente")){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let busqueda = "SELECT * FROM usuarios_pacientes WHERE id_paciente = ?";
      conn.query(busqueda, [req.body.idPaciente], (errorBusqueda, resultadoBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultadoBusqueda.length > 0){
            const operaciones = [
              {tabla : "alimento_dieta", id : req.body.idPaciente, conexion : conn},
              {tabla : "mediciones", id : req.body.idPaciente, conexion : conn},
              {tabla : "proximas_citas", id : req.body.idPaciente, conexion : conn},
              {tabla : "historial_profesionales", id : req.body.idPaciente, conexion : conn},
              {tabla : "citas", id : req.body.idPaciente, conexion : conn},
              {tabla : "habito_personal", id : req.body.idPaciente, conexion : conn},
              {tabla : "habito_alimenticio", id : req.body.idPaciente, conexion : conn},
              {tabla : "imgUsuariosPacientes", id : req.body.idPaciente, conexion : conn},
              {tabla : "infoMpaciente", id : req.body.idPaciente, conexion : conn},
              {tabla : "ejercicio_rutina", id : req.body.idPaciente, conexion : conn},
              {tabla : "usuarios_pacientes", id : req.body.idPaciente, conexion : conn}
            ];

            const promesasOP = operaciones.map(operacion => {
              return eliminaRegistroPaciente(operacion.tabla, operacion.id, operacion.conexion);
            });

            Promise.all(promesasOP).then(resultados => {
              const errores = resultados.filter(resultado => !resultado.exitosa).length;
              if(errores > 0){
                res.status(500).send({mensaje : "Error en las operaciones", error : errores});
              }else{
                ejemplosCorreo.eliminaUsuario(resultadoBusqueda[0].nombre, resultadoBusqueda[0].apPaterno, resultadoBusqueda[0].apMaterno, (html) => {
                  correoEnvio.crearOpcionesCorreo(""+resultadoBusqueda[0].email, "Confirmación de Eliminación de Registro de Usuario en la Aplicación 2BFit", html);
                  correoEnvio.enviaCorreo((objeto) => {
                    if(objeto.OK == 1){
                      res.status(200).send({mensaje : "Eliminación exitosa"});
                    }else if(objeto.OK == 0){
                      res.status(500).send({mensaje : "Error en el envio del correo, compruebe el correo"});
                    }
                  });
                });
              }
            }).catch(error => {
              res.status(500).send({mensaje : "Error en las promesas", error : error});
            });
          }else{//no existe
            res.status(404).send({mensaje : "Usuario no existente"});
          }
        }
      });
    }
  }
});

function eliminaRegistroPaciente(tabla, id, conexion){
  return new Promise((resolve, reject) => {
    var query = `DELETE FROM ${tabla} WHERE id_paciente = ?`;
    conexion.query(query, [id], (err, result) => {
      if(err){
        console.log("Error al eliminar el registro : " + err.message);
        resolve({operacion : "ELIMINACION", tabla : tabla, exitosa : false});
      }else{
        resolve({operacion : "ELIMINACION", tabla : tabla, exitosa : true});
      }
    });
  });
}

//MÉTODO DE ELIMINACIÓN DE VIDEOS USUARIOS PROFESIONALES
    //MÉTODO PARA ELMINAR UN VIDEO DE LA BASE DE DATOS, UTILIZANDO EL ID COMO PARAMETRO PARA REALIZARLO
      //primero actualizamos los ejercicios que se tengan creados y sean el id del video, despues se realiza la eliminacion del video
app.delete("/borraVideoId", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin informacion"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
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
    
    //MÉTODO DE ELIMINACIÓN DE VIDEOS DE PROFESIONALES DE LA SALUD
app.delete("/borraVideosProfesional", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      let query = "SELECT * FROM videos WHERE id_profesional = ?";
      conn.query(query, [req.body.id], (errorbusqueda, resultbusqueda) => {
        if(errorbusqueda){
          console.log(errorbusqueda);
          res.status(500).send({mensaje : errorbusqueda.message, codigo : errorbusqueda.code});
        }else{
          if(resultbusqueda.length > 0){
            const operaciones = [];
            for(let i = 0; i < resultbusqueda.length; i++){
              operaciones.push(
                {tipo : 1, valor : resultbusqueda[i].id_video, conexion : conn},
                {tipo : 2, valor : resultbusqueda[i].id_video, conexion : conn}
              );
            }
            //console.log(operaciones);
            
            const promesasVideos = operaciones.map(operacion => {
              //el valor de operacion es 1 para actualizar en caso de que este asignado a una rutina colocar el valor de 0 en ese registro
              //y si el valor de la operación es 2 para eliminar el registro de la tabla de videos
              if(operacion.tipo == 1)
                return actualizaRegistroVideosER(operacion.valor, operacion.conexion);
              else if(operacion.tipo == 2)
                return eliminaRegistroVideos(operacion.valor, operacion.conexion);
            });
            
           
            Promise.all(promesasVideos).then(resultados => {
              //console.log(resultados);
              const errores = resultados.filter(resultado => !resultado.exito).length;
              if(errores > 0){
                res.status(500).send({mensaje : "Error en las promesas", error : errores});
              }else{
                res.status(200).send({mensaje : "Eliminación exitosa"});
              }
              
            }).catch(error => {
              res.status(500).send({mensaje : "Error en las promesas, dentro del catch", error : error});
            });
            
          }else{
            res.status(404).send({mensaje : "No se encontraron registros con este id"});
          }
        }
      });
    }
  }
});

function actualizaRegistroVideosER(valor, conexion){
  return new Promise((resolve, reject) => {
    let query = "SELECT id_ER FROM ejercicio_rutina WHERE id_video = ?";
    conexion.query(query, [valor], (error, result)=>{
      if(error){
        console.log(error);
        resolve({operacion : "Actualización", exito : false});
      }else{
        for(let i = 0; i < result.length; i++){
          //hacemos la actualización
          let queryActVideo = "UPDATE ejercicio_rutina SET id_video = 0 WHERE id_ER = ?";
          conexion.query(queryActVideo, [result[i].id_ER], (errorActualiza, resultActualiza) => {
            if(errorActualiza){
              console.log(errorActualiza);
              resolve({operacion : "Actualizacion", exito : false});
            }
          });
        }
        resolve({operacion : "Actualizacion", exito : true});
      }
    }); 
  });
}

function eliminaRegistroVideos(valor, conexion){
  return new Promise((resolve, reject) => {
    resolve({operacion : "Eliminacion", exito : true});
    let query = "DELETE FROM videos WHERE id_video = ?";
    conexion.query(query, [valor], (error, result) => {
      if(error){
        console.log(error);
        resolve({operacion : "Eliminacion", exito : false});
      }else{
        resolve({operacion : "Eliminacion", exito : true});
      }
    });
  });
}

//MÉTODO DE ELIMINACIÓN DE FOTOS USUARIOS PROFESIONALES
  //obtenemos como valor dentro de la solicitud el identificador del profesional
app.delete("/borraIMG/profesional", (req, res) =>{
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let busqueda = "SELECT id_profesional FROM imgUsuariosProfesionales WHERE id_profesional = ?";
      conn.query(busqueda, [req.body.id], (errorBusqueda, resulBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resulBusqueda.length > 0){
            //realizamos la eliminación
            let queryElimina = "DELETE FROM imgUsuariosProfesionales WHERE id_profesional = ?";
            conn.query(queryElimina, [req.body.id], (errorElimina, resultElimina) => {
              if(errorElimina){
                console.log(errorElimina);
                res.status(500).send({mensaje : errorElimina.message, codigo : errorElimina.code});
              }else{
                if(resultElimina.affectedRows > 0){
                  res.status(200).send({mensaje : "Eliminación exitosa de imagen"});
                }
              }
            });
          }else{
            res.status(404).send({mensaje : "No se cuenta con imagen"});
          }
        }
      });
    }
  }
});

//MÉTODO DE ELIMINACIÓN DE FOTOS USUARIOS PACIENTES
  //obtenemos como valor dentro de la solicitud el identificador del paciente
app.delete("/borraIMG/paciente", (req, res) =>{
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let busqueda = "SELECT id_paciente FROM imgUsuariosPacientes WHERE id_paciente = ?";
      conn.query(busqueda, [req.body.id], (errorBusqueda, resulBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resulBusqueda.length > 0){
            //realizamos la eliminación
            let queryElimina = "DELETE FROM imgUsuariosPacientes WHERE id_paciente = ?";
            conn.query(queryElimina, [req.body.id], (errorElimina, resultElimina) => {
              if(errorElimina){
                console.log(errorElimina);
                res.status(500).send({mensaje : errorElimina.message, codigo : errorElimina.code});
              }else{
                if(resultElimina.affectedRows > 0){
                  res.status(200).send({mensaje : "Eliminación exitosa de imagen"});
                }
              }
            });
          }else{
            res.status(404).send({mensaje : "No se cuenta con imagen"});
          }
        }
      });
    }
  }
});

//MÉTODO DE ELIMINACIÓN DE CITAS Y PRÓXIMAS CITAS
  //citas
app.delete("/borraCitas", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.idProfesional === "" || req.body.idPaciente === "" || req.body.idTipoCita === "" || req.body.fecha=== "" || req.body.hora === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      let queryBusqueda = `SELECT * FROM citas WHERE id_tipoCita = ? AND id_profesional = ? AND id_paciente = ? AND fecha_hora LIKE ('%${req.body.fecha}% %${req.body.hora}%')`;
      conn.query(queryBusqueda, [req.body.idTipoCita, req.body.idProfesional, req.body.idPaciente], (errorbusqueda, resultbusqueda) => {
        if(errorbusqueda){
          console.log(errorbusqueda);
          res.status(500).send({mensaje : errorbusqueda.message, codigo : errorbusqueda.code});
        }else{
          if(resultbusqueda.length > 0){
            let queryElimina = `DELETE FROM citas WHERE id_tipoCita = ? AND id_profesional = ? AND id_paciente = ? AND fecha_hora LIKE ('%${req.body.fecha}% %${req.body.hora}%')`;
            conn.query(queryElimina, [req.body.idTipoCita, req.body.idProfesional, req.body.idPaciente], (errorElimina, resultElimina) => {
              if(errorElimina){
                console.log(errorElimina);
                res.status(500).send({mensaje : errorElimina.message, codigo : errorElimina.code});
              }else{
                if(resultElimina.affectedRows > 0){
                  res.status(200).send({mensaje : "Eliminación exitosa de registro"});
                }
              }
            });
          }else{
            res.status(404).send({mensaje : "Registro no encontrado"});
          }
        }
      });
    }
  }
});
  //proximas citas
app.delete("/borraProximasCitas", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.idProfesional === "" || req.body.idPaciente === "" || req.body.fecha=== "" || req.body.hora === ""){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      let queryBusqueda = `SELECT * FROM proximas_citas WHERE id_profesional = ? AND id_paciente = ? AND fecha_hora LIKE ('%${req.body.fecha}% %${req.body.hora}%')`;
      conn.query(queryBusqueda, [req.body.idProfesional, req.body.idPaciente], (errorbusqueda, resultbusqueda) => {
        if(errorbusqueda){
          console.log(errorbusqueda);
          res.status(500).send({mensaje : errorbusqueda.message, codigo : errorbusqueda.code});
        }else{
          if(resultbusqueda.length > 0){
            let queryElimina = `DELETE FROM proximas_citas WHERE id_profesional = ? AND id_paciente = ? AND fecha_hora LIKE ('%${req.body.fecha}% %${req.body.hora}%')`;
            conn.query(queryElimina, [req.body.idProfesional, req.body.idPaciente], (errorElimina, resultElimina) => {
              if(errorElimina){
                console.log(errorElimina);
                res.status(500).send({mensaje : errorElimina.message, codigo : errorElimina.code});
              }else{
                if(resultElimina.affectedRows > 0){
                  res.status(200).send({mensaje : "Eliminación exitosa de registro"});
                }
              }
            });
          }else{
            res.status(404).send({mensaje : "Registro no encontrado"});
          }
        }
      });
    }
  }
});

  //* Creación de reporte médico
//normalmente se cuenta con los siguientes datos:
  /*
  Datos personales, motivo y fecha de consulta
  Información clinica, enfermedades, medicación, alergias, intolerancias
  antecedentes familiares
  habitos alimenticios
  nivel de actividad
  exploración fisica: peso, altura, contorno de cintura, imc
   */
  //obtenemos como valor dentro del body el id del paciente a buscar
app.get("/obtenReporteMedico/:id", (req, res) => {
  const idPaciente = req.params.id;
    if(!idPaciente){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      const conn = conexion.cone;
      let queryBusquedaUsuario = "SELECT * FROM usuarios_pacientes WHERE id_paciente = ?";
      conn.query(queryBusquedaUsuario, [idPaciente], (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            let queryobtenInfo = "SELECT up.id_paciente, up.nombre, up.apPaterno, up.apMaterno, up.fecha_N, infoM.estatura, infoM.ocupacion, infoM.imc, infoM.objetivo, infoM.alergias, infoM.medicamentosC, infoM.enferm, infoM.enfermFam, up.email, up.edad, up.fecha_n, up.numTel FROM infompaciente as infoM, usuarios_pacientes as up WHERE infoM.id_paciente = ? and up.id_paciente = infoM.id_paciente";
            //obtenemos la información basica del usuario            
            conn.query(queryobtenInfo, [idPaciente], (errorBusquedaInfo, resultBusquedaInfo) => {
              if(errorBusquedaInfo){
                console.log(errorBusquedaInfo);
                res.status(500).send({mensaje : errorBusquedaInfo.message, codigo : errorBusquedaInfo.code});
              }else{
                if(resultBusquedaInfo.length > 0){
                  //contamos con la información
                  let objeto = {}, data = [];
                  let fecha = new Date(resultBusquedaInfo[0].fecha_N);
                  //primero almacenamos los datos datos personales
                  objeto = {
                    id_paciente : resultBusquedaInfo[0].id_paciente,
                    nombreCompleto : resultBusquedaInfo[0].nombre + " " + resultBusquedaInfo[0].apPaterno + " " + resultBusquedaInfo[0].apMaterno,
                    edad : resultBusquedaInfo[0].edad,
                    fechaNacimiento : ""+fecha.getUTCDate()+"-"+(fecha.getUTCMonth()+1)+"-"+fecha.getUTCFullYear(),
                    email : resultBusquedaInfo[0].email,
                    numeroTel : resultBusquedaInfo[0].numTel, 
                    ocupacion : resultBusquedaInfo[0].ocupacion, 
                    imc : resultBusquedaInfo[0].imc, 
                    objetivo : resultBusquedaInfo[0].objetivo, 
                    alergias : resultBusquedaInfo[0].alergias, 
                    medicamentosC : resultBusquedaInfo[0].medicamentosC 
                  };
                  const promesasInfo = [
                    {tabla : "habito_personal", id : idPaciente, conexion : conn, tipo : 0},
                    {tabla : "habito_alimenticio", id : idPaciente, conexion : conn, tipo : 0},
                    {tabla : "mediciones", id : idPaciente, conexion : conn, tipo : 0}
                    //c_enfermedades
                  ];
                  let cantEnfermedadesPaciente = resultBusquedaInfo[0].enferm.split(','), cantEnfermedadesFamiliares = resultBusquedaInfo[0].enfermFam.split(',');
                  for(let i = 0; i < cantEnfermedadesPaciente.length; i++){
                    promesasInfo.push({tabla : "c_enfermedades", id : cantEnfermedadesPaciente[i], conexion : conn, tipo : "paciente"});
                  }
                  for(let i = 0; i < cantEnfermedadesFamiliares.length; i++){
                    promesasInfo.push({tabla : "c_enfermedades", id : cantEnfermedadesFamiliares[i], conexion : conn, tipo : "profesional"});
                  }
                  const promesasTabla = promesasInfo.map(operacion => {
                    return obtenInfo(operacion.tabla, operacion.id, operacion.conexion, operacion.tipo);
                  });
                  generaObjetoJSONReporteMedico(promesasTabla).then(objetoCompleto => {
                    objeto.habitoPersonal = objetoCompleto.habitoPersonal;
                    objeto.habitoAlimenticio = objetoCompleto.habitoAlimenticio;
                    objeto.mediciones = objetoCompleto.mediciones;
                    objeto.enfermedadesPaciente = objetoCompleto.enfermedadesPaciente;
                    objeto.enfermedadesFamiliares = objetoCompleto.enfermedadesFam;
                    res.status(200).send({mensaje : "Obtención exitosa de información", objeto : objeto});
                  }).catch(error =>{
                    console.log(error);
                  });
                }else{
                  //no contamos con la información necesaria
                  res.status(404).send({mensaje : "No se cuenta con toda la información para realizar el reporte de este usuario, llene los elementos que falten o si es un error pongase en contacto con el administrado."});
                }
              }
            });
          }
        }
      });
    }
});

function obtenInfo(tabla, id, conexion, tipo){
  return new Promise((resolve, reject) => {
    var query;
    if(tabla == "mediciones")
      query = `SELECT * FROM mediciones WHERE id_paciente = ${id} ORDER BY fecha asc`;//de esta manera podemos obtener el primera y ultima medicion
    else if(tabla == "c_enfermedades")
      query = `SELECT * FROM c_enfermedades WHERE id_enfermedad = ${id}`
    else query = `SELECT * FROM ${tabla} WHERE id_paciente = ${id}`;

    conexion.query(query, (error, result) => {
      if(error){
        resolve({operacion : "Busqueda", exitosa : false, tabla : tabla, error : error});
      }else{
        if(tabla == "mediciones"){
          //hago el envio del primer y ultimo valor
          var objeto = {
            primeraFecha : result[0].fecha, 
            primeraMedicion: {
              peso: result[0].peso,
              axiliar_media: result[0].axiliar_media,
              abdominal: result[0].abdominal,
              bicipital: result[0].bicipital,
              muslo: result[0].muslo,
              suprailiaco: result[0].suprailiaco,
              triceps: result[0].triceps,
              subescapular: result[0].subescapular,
              toracica: result[0].toracica,
              pantorrilla_medial: result[0].pantorrilla_medial,
              cintura: result[0].cintura
            },
            ultimaFecha : result[result.length-1].fecha,
            ultimaMedicion : {
              peso: result[result.length-1].peso,
              axiliar_media: result[result.length-1].axiliar_media,
              abdominal: result[result.length-1].abdominal,
              bicipital: result[result.length-1].bicipital,
              muslo: result[result.length-1].muslo,
              suprailiaco: result[result.length-1].suprailiaco,
              triceps: result[result.length-1].triceps,
              subescapular: result[result.length-1].subescapular,
              toracica: result[result.length-1].toracica,
              pantorrilla_medial: result[result.length-1].pantorrilla_medial,
              cintura: result[result.length-1].cintura
            }
          };
          resolve({operacion : "Busqueda", exitosa : true, data : objeto, tabla : tabla, tipo : tipo});
        }else if(tabla == "c_enfermedades"){
          resolve({operacion : "Busqueda", exitosa : true, data : {id: id, descripcion : result[0].descripcion}, tabla : tabla, tipo : tipo});
        }else{
          resolve({operacion : "Busqueda", exitosa : true, data : result[0], tabla : tabla, tipo : tipo});
        }
      }
    });
  });
}

function generaObjetoJSONReporteMedico(promesasTabla){
  return Promise.all(promesasTabla).then(resultados => {
    var enfermedadesPaciente = [], enfermedadesFam = [];
    var habitoPersonal = {}, habitoAlimenticio = {}, mediciones = {};
    for(let i = 0; i < resultados.length; i++){
        if(resultados[i].tabla === "habito_personal"){
          habitoPersonal.horaDespierto = resultados[i].data.horaD;
          habitoPersonal.horaSueno = resultados[i].data.horaS;
          habitoPersonal.descFisica = resultados[i].data.desc_fisica;
          habitoPersonal.rutinaDiaria = resultados[i].data.rutinaDia;
          //console.log(objetoRM);
        }else if(resultados[i].tabla === "habito_alimenticio"){
          //console.log(resultados[i])
          habitoAlimenticio.alimentosMasConsumidos = resultados[i].data.masConsumidos;
          habitoAlimenticio.alimentosAlergia = resultados[i].data.alimentos_alergia;
          habitoAlimenticio.cantidadConsumoAgua = resultados[i].data.cantidad_agua;
          habitoAlimenticio.cantidadComidas = resultados[i].data.cantidad_comidas;
          habitoAlimenticio.cantidad_colaciones = resultados[i].data.cantidad_colaciones;
          habitoAlimenticio.horaDesayuno = resultados[i].data.horaDesayuno;
          habitoAlimenticio.horaComida = resultados[i].data.horaComida;
          habitoAlimenticio.horaCena = resultados[i].data.horaCena;
        }else if(resultados[i].tabla === "mediciones"){
          let fechaInicial = new Date(resultados[i].data.primeraFecha);
          let fechaFinal = new Date(resultados[i].data.ultimaFecha);
          mediciones.primeraFecha = ""+fechaInicial.getUTCDate()+"-"+(fechaInicial.getUTCMonth()+1)+"-"+fechaInicial.getUTCFullYear();
          mediciones.primeraMedicion = resultados[i].data.primeraMedicion;
          mediciones.ultimaFecha = ""+fechaFinal.getUTCDate()+"-"+(fechaFinal.getUTCMonth()+1)+"-"+fechaFinal.getUTCFullYear();
          mediciones.ultimaMedicion = resultados[i].data.ultimaMedicion;
          //console.log(objetoRM);
        }else if(resultados[i].tabla === "c_enfermedades"){
          if(resultados[i].tipo == "paciente"){
            enfermedadesPaciente.push({id : resultados[i].data.id, descripcion : resultados[i].data.descripcion});
          }else if(resultados[i].tipo == "profesional"){
            enfermedadesFam.push({id : resultados[i].data.id, descripcion : resultados[i].data.descripcion})
          }
          /*
          objetoRM.enfermedadesPaciente = enfermedadesPaciente;
          objetoRM.enfermedadesFamilia = enfermedadesFam;
          */
          //console.log(objetoRM);
        }
    }
    const objetoReporte = {
      habitoPersonal,
      habitoAlimenticio,
      mediciones,
      enfermedadesPaciente,
      enfermedadesFam
    };
    return objetoReporte;
  });
}


  //Recuperación de contraseña
  //obtenemos el correo del usuario y el tipo de usuario al que se refiere
app.post("/recuperaContra", (req, res) => {
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.correo === "" || req.body.tipoUsuario === "" || req.body.nombre === "" || req.body.apPaterno === "" || req.body.apMaterno === "" || req.body.fechaN === "" ){
      res.status(500).send({mensaje : "Error, datos incompletos"});
    }else{
      const conn = conexion.cone;
      let queryBusquedaUsuario = "";
      //valor de tipos de usuario 1 si es profesional y 2 si es paciente
      if(req.body.tipoUsuario == 1)
        queryBusquedaUsuario = `SELECT * FROM usuarios_profesionales WHERE email = '${req.body.correo}' AND nombre LIKE '%${req.body.nombre}%' AND apPaterno LIKE '%${req.body.apPaterno}%' AND apMaterno LIKE '%${req.body.apMaterno}%' AND fecha_N LIKE '%${req.body.fechaN}%'`;
      else if(req.body.tipoUsuario == 2)
        queryBusquedaUsuario = `SELECT * FROM usuarios_pacientes WHERE email = '${req.body.correo}' AND nombre LIKE '%${req.body.nombre}%' AND apPaterno LIKE '%${req.body.apPaterno}%' AND apMaterno LIKE '%${req.body.apMaterno}%' AND fecha_N LIKE '%${req.body.fechaN}%'`;
      conn.query(queryBusquedaUsuario,  (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length <= 0){
            res.status(404).send({mensaje : "Usuario no encontrado, verifique los datos ingresados"});
          }else{
            //console.log(resultBusqueda);
            let nuevaContra = generaContrasRecuperacion();
            let queryActualizaContra = "", id;
            if(req.body.tipoUsuario == 1){
              queryActualizaContra = "UPDATE usuarios_profesionales SET password = ? WHERE id_profesional = ?";
              id = resultBusqueda[0].id_profesional;
            } else if(req.body.tipoUsuario == 2){
              queryActualizaContra = "UPDATE usuarios_pacientes SET password = ? WHERE  id_paciente = ?";
              id = resultBusqueda[0].id_paciente;
            }
            conn.query(queryActualizaContra, [nuevaContra, id], (errorActualiza, resultActualiza) => {
              if(errorActualiza){
                console.log(errorActualiza);
                res.status(500).send({mensaje : errorActualiza.message, codigo : errorActualiza.code});
              }else 
              if(resultActualiza.affectedRows > 0){
                ejemplosCorreo.recuperaContra(resultBusqueda[0].nombre, resultBusqueda[0].apPaterno, resultBusqueda[0].apMaterno, nuevaContra, (html)=>{  
                  correoEnvio.crearOpcionesCorreo(""+resultBusqueda[0].email, "Recuperación de contraseña.", html);
                  correoEnvio.enviaCorreo((objeto) => {
                    //console.log(objeto);
                    if(objeto.OK == 1){
                      res.status(200).send({mensaje : "Obtención exitosa", contra : nuevaContra});
                    }else if(objeto.OK == 0){
                      res.status(500).send({mensaje : "Error en el envio del correo, compruebe el correo"});
                    }
                  });
                });
              }
            });
          }
        }
      });
    }
  }
});  

function generaContrasRecuperacion(){
  const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|;:,.<>?';
  let contrasena = '';
  for (let i = 0; i < 16; i++) {
    const caracterAleatorio = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    contrasena += caracterAleatorio;
  }
  return contrasena;
}

  //MÉTODO DE CAMBIO DE CONTRASEÑA
    //obtenemos el id del usuario, contraseña nueva y pasada, tambien el tipo de usuario
app.put("/cambioContra", (req, res) => {
  console.log(req.body);
  if(JSON.stringify(req.body) === '{}'){
    res.status(500).send({mensaje : "Sin información"});
  }else{
    if(req.body.id === "" || req.body.contraPasada === "" || req.body.contraNueva === "" || req.body.tipoUsuario === ""){
      res.status(500).send({mensaje : "Error. Datos incompletos"});
    }else{
      let queryBusqueda, queryActualizaContra;
      const conn = conexion.cone;
      if(req.body.tipoUsuario === "profesional"){
        queryBusqueda = "SELECT * FROM usuarios_profesionales WHERE id_profesional = ?";
        queryActualizaContra = "UPDATE usuarios_profesionales SET password = ? WHERE id_profesional = ? AND password = ?";
      }else if(req.body.tipoUsuario === "paciente"){
        queryBusqueda = "SELECT * FROM usuarios_pacientes WHERE id_paciente = ?";
        queryActualizaContra = "UPDATE usuarios_pacientes SET password = ? WHERE id_paciente = ? AND password = ?";
      }
      conn.query(queryBusqueda, [req.body.id], (errorBusqueda, resultBusqueda) => {
        if(errorBusqueda){
          console.log(errorBusqueda);
          res.status(500).send({mensaje : errorBusqueda.message, codigo : errorBusqueda.code});
        }else{
          if(resultBusqueda.length > 0){
            conn.query(queryActualizaContra, [req.body.contraNueva, req.body.id, req.body.contraPasada], (errorActualiza, resultActualiza) => {
              if(errorActualiza){
                console.log(errorActualiza);
                res.status(500).send({mensaje : errorActualiza.message, codigo : errorActualiza.code});
              }else{
                if(resultActualiza.affectedRows > 0){
                  ejemplosCorreo.cambiaContra(resultBusqueda[0].nombre, resultBusqueda[0].apPaterno, resultBusqueda[0].apMaterno, (html) => {
                    correoEnvio.crearOpcionesCorreo(""+resultBusqueda[0].email, "Cambio de contraseña.", html);
                    correoEnvio.enviaCorreo((objeto) => {
                      if(objeto.OK == 1){
                        res.status(200).send({mensaje : "Contraseña actualizada."});
                      }else if(objeto.OK == 0){
                        res.status(500).send({mensaje : "Error en el envio del correo, comprueba la información"});
                      }
                    });
                  });
                }else{
                  res.status(200).send({mensaje : "Información no actualizada, verifique su entrada"});
                }
              }
            });
          }else{
            res.status(404).send({mensaje : "Usuario no encontrado"});
          }
        }
      });
    }
  }
});

  //MÉTODO DE ACTUALIZACIÓN DE FECHAS
    //SE HARÁ USO DE FUNCIONES COMO NOW Y CURDATE DE MYSQL, DEBIDO A QUE NOS ENCONTRAMOS USANDO EN LA MISMA MAQUINA LA BD Y EL BACKEND SINO HABRÍA QUE USAR UNA API DE TIEMPO Y REALIZAR LA ACTUALIZACION
    /*
    usuarios_profesionales //actualizar fecha de nacimiento
    usuarios_pacientes //actualizar fecha de nacimiento
    citas //este es datetime de modo que hay que corroborrar el metodo
    ejercicio_rutina
    proximas_citas
     */
app.put("/actualizaFechas", async (req, res) => {
  const dataApiTiempo = await fetch('http://worldtimeapi.org/api/timezone/America/Mexico_City');
  if(dataApiTiempo.ok){
    const json = await dataApiTiempo.json();
    let fecha = new Date(json.datetime);
    //obtenemos la fecha de la api
    let hora = fecha.getHours() + ":" + fecha.getUTCMinutes() + ":" + fecha.getUTCSeconds();
    let fechaFinal = fecha.getUTCFullYear() + "-" + (fecha.getUTCMonth() + 1 ) + "-" + fecha.getDate();
    let horaFecha = fechaFinal+" "+hora;
    //console.log(hora, fechaFinal );
    const conn = conexion.cone;
    const operaciones = [
      //valor 1 es cuando es necesario realizar la actualización de fecha de nacimiento
      //2 para el caso de actualizar el valor de valido
      //3 este caso es para eliminar los registros
      {operacion : 1,  tabla : "usuarios_profesionales", datos : fechaFinal, conexion : conn, campo : "id_profesional"},
      {operacion : 1,  tabla : "usuarios_pacientes", datos : fechaFinal, conexion : conn, campo : "id_paciente"},
      {operacion : 3,  tabla : "citas", datos : horaFecha, conexion : conn },
      {operacion : 3,  tabla : "proximas_citas", datos : horaFecha, conexion : conn},
      {operacion : 2,  tabla : "ejercicio_rutina", datos : fechaFinal, conexion : conn }
    ];
    const promesasOP = operaciones.map(operacion => {
      if(operacion.operacion == 1){
        return actualizaFechaNacimiento(operacion.tabla, operacion.datos, operacion.conexion, operacion.campo);
      }else if(operacion.operacion == 2){
        return actualizaValorDeValido(operacion.tabla, operacion.datos, operacion.conexion);
      }else if(operacion.operacion == 3){
        return eliminaRegistrosCitas(operacion.tabla, operacion.datos, operacion.conexion);
      }
    });
    Promise.all(promesasOP).then(resultados => {
      const errores = resultados.filter(resultado => !resultado.exitosa).length;
      if(errores > 0){
        res.status(500).send({mensaje : "Error en las operaciones", error : errores});
      }else{
        res.status(200).send({mensaje : "Actualizacion de datos correctos"});
      }
    }).catch(error => {
      console.log(error);
      res.status(500).send({mensaje : "Error en las promesas", error : error});
    });
    
  }else{//realizamos la actualización utilizando los valores del
    res.status(404).send("Error al obtener la información de la API")
  }
});
function actualizaFechaNacimiento(tabla, datos, conexion, campo){
 return new Promise((resolve, reject) => {
  var query = `UPDATE ${tabla} SET edad = TIMESTAMPDIFF(YEAR, fecha_N, '${datos}')  Where ${campo} > 0;`;
  conexion.query(query, (error, result) => {
    if(error){
      console.log("Error al actualizar las fechas de nacimiento", error);
      resolve({operacion : "Actualizacion", tabla : tabla, exitosa : false});
    }else{
      resolve({operacion : "Actualizacion", tabla : tabla, exitosa : true});
    }
  });


 });
}
function actualizaValorDeValido(tabla, datos, conexion){
  return new Promise((resolve, reject) => {
    var query = ` UPDATE ${tabla} SET vigencia = '0' WHERE fechaFin < '${datos}' AND vigencia = '1'`;
    conexion.query(query, (error, result) => {
      if(error){
        console.log("Error al actualizar los ejerciciosRutina", error);
        resolve({operacion : "Actualizacion", tabla : tabla, exitosa : false});
      }else{
        resolve({operacion : "Actualizacion", tabla : tabla, exitosa : true});
      }
    });
  });
}
function eliminaRegistrosCitas(tabla, datos, conexion){
  return new Promise((resolve, reject) => {
    var query = `DELETE FROM ${tabla} WHERE fecha_hora < '${datos}'`;
    conexion.query(query, (error, result) => {
      if(error){
        console.log("Error al eliminar los registro de las citas", error);
        resolve({operacion : "Eliminacion", tabla : tabla, exitosa : false});
      }else{
        resolve({operacion : "Eliminacion", tabla : tabla, exitosa : true});
      }
    });
  });
}
  //METODOS DE CONFIGURACIÓN DEL SERVIDOR
  //192.168.100.9 192.168.56.1
app.listen(3000, "192.168.100.9", function () {
  console.log("Funcionando en el puerto: 3000");
  //obtenemos la fecha actual de CDMX
  apis.apiTiempo()
  .then(data => {//obtenemos la fecha actual en CDMX
    //separamos los elementos
    let partes = data.split('-');
    const anoAPI = partes[0];
    const mesAPI = partes[1];
    const diaAPI = partes[2];
    fechaApi = anoAPI+"-"+mesAPI+"-"+diaAPI;
  })
  .catch(error => {
    console.error("Error dentro de la petición", error);
  });
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
