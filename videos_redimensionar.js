const ffmpeg = require("fluent-ffmpeg");
const fs = require("node:fs");
const fss = require('fs').promises;
const conexion = require("./conexionBD");

function pasar360(url, folderVideo, id, nombreVideo, callback) {
  //console.log(url, folderVideo, id, nombreVideo)
  const rutaVideo360 = `${folderVideo}/${id}_360_${nombreVideo}`;
  const nombre = `${id}_360_${nombreVideo}`;
  const comando = ffmpeg(url);
  var resultado = {};
  comando.videoCodec("libx264")
    .audioCodec("aac")
    .size("640x360")
    .on("end", () => {
      
        //var obj = eliminaVideoO(url, rutaVideo360, id, nombre);
      //hacemos la eliminación del archivo base del video y cargamos a la BD el video en 360
      var data_obj = [];
      fs.unlink(url, (errorEliminar) => {
        if (errorEliminar) {
          return { error: errorEliminar };
        } else {
          const conn = conexion.cone;
          //realizamos la subida del video a la BD
          const data = fs.readFileSync(rutaVideo360);
          //console.log(data);
          const query = "INSERT INTO videos VALUES (?, ?, ?, ?)";
          conn.query(query, [0, id, nombreVideo, data], (errorInsert, resultInsert) => {
              if (errorInsert) {
                data_obj.push({ codigo: 500, mensaje: errorInsert });
                
                resultado.codigo = 500;
                resultado.mensaje = errorInsert;
                callback(resultado);
                return resultado;
              } else {
                data_obj.push({
                  codigo: 200,
                  mensaje: "Video subido con exito",
                });

                resultado.codigo = 200;
                resultado.mensaje = "Video subido con exito";
                callback(resultado);
                return resultado;
              }
              //console.log("info: ", resultado)
            }
          );
        }
      });
    })
    .on("error", (error) => {
      console.log("Error al convertir el video: ", error);
    })
    .save(rutaVideo360);
}

function eliminaArchivosVideo(callback) {
    let errorCont = 0;
    var objeto;
    fs.readdir(__dirname+"/archivos/videosProfesionales", (error_, resultado) => {
        if(error_){
            console.log(error_);
            errorCont++;
            objeto = {codigo : 500, error : error_};
            callback(objeto, errorCont);
        }else{
            for(let i = 0; i < resultado.length; i++){
                fs.readdir(__dirname+"/archivos/videosProfesionales/"+resultado[i], (errorBusqueda, resultadoBusqueda) =>{
                    if(errorBusqueda){
                        objeto = {codigo : 500, error : errorBusqueda};
                        errorCont++;
                        callback(objeto, errorCont);
                    }else{
                        for(let j = 0; j < resultadoBusqueda.length; j++){
                            fs.unlink(__dirname+"/archivos/videosProfesionales/"+resultado[i]+"/"+resultadoBusqueda[j], (errorB) => {
                                if(errorB){
                                    console.log(errorB);
                                    errorCont++;
                                    objeto = {codigo : 500, error : error_};
                                    callback(objeto, errorCont);
                                }
                            });
                        }
                        //callback(objeto, errorCont);
                    }
                });
            }
            callback(objeto, errorCont);
        }
    });
    /*
    fss.rmdir(__dirname+"/archivos/videosProfesionales/", {recursive:true}).then(() => {
        console.log("folder eliminado")
    }).catch(error => {
        console.log(error);
    })
    */
    /*
    fs.unlink(__dirname+"/archivos/videosProfesionales/", (errorElimar) => {
        if(errorElimar){
            return errorElimar;
        }else{
            return "Eliminacion exitosa";
        }
    });
    */
}

module.exports = {
  pasar360,
  eliminaArchivosVideo
};
