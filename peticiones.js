/*ARCHIVO PARA REALIZAR LAS PETICIONES A LAS APIS QUE DESEAMOS UTILIZAR DENTRO DEL TT,
en este caso se hara uso de obtención de tiempo y fecha de la ciudad de México, esto para
obtener de forma exacta la misma */
//para realizar las peticiones a api
const http = require('http');
const axios = require('axios');
var info;
function apiTiempo (){//reailzamos una consulta a una API de tiempo para obtener la fecha actual de la CDMX para que el usuario no tenga que realizar la inserción de su edad
    const urlp = 'http://worldtimeapi.org/api/timezone/America/Mexico_City';
    return new Promise((resolve, reject) => {
        axios.get(urlp)
        .then(response => {
            const data = response.data;
            const fechaHora = data.datetime;
            let fecha = fechaHora.split('T');
            resolve(fecha[0]);
        })
        .catch(error => {
            reject(error);
        });
    });
}

async function obtenTiempo(){
    const response = await fetch(`http://worldtimeapi.org/api/timezone/America/Mexico_City`, {method:"get"});

    const jsonResponse = await response.json;

    return jsonResponse;
}

function generaResult(data){
    info = data;
    //console.log(info)
}

module.exports={
    apiTiempo, obtenTiempo
};

/*PRUEBA 21092023

const urlp = `192.168.100.9:3000/obtenVideoPorId`;//'http://worldtimeapi.org/api/timezone/America/Mexico_City';
    return new Promise((resolve, reject) => {
        axios.get(urlp, {data : {"id":61}})
        .then(response => {
            //console.log(response.statusText) EJEMPLO CON AXIOS DE COMO OBTENEMOS EL MENSAJE DE UN API
            const data = response.data;
            const fechaHora = data.datetime;
            let fecha = fechaHora.split('T');
            resolve(fecha[0]);
        })
        .catch(error => {
            reject(error);
        });
    });

*/


/*let valor = {};
    fetch(`http://worldtimeapi.org/api/timezone/America/Mexico_City`, {method:"get"})
    .then((response) => response.json())
    .catch((error) => console.log(error))
    .then((json) => {
        //console.log(json);
        generaResult(json)
    });
    */

    /*
   return new Promise((resolve, reject) =>{
    fetch(`http://worldtimeapi.org/api/timezone/America/Mexico_City`, {method:"get"})
   .then((response) => {return response.json()})
   .then((json)=>resolve(json))
   });
   */
    /*let response = await fetch(`http://worldtimeapi.org/api/timezone/America/Mexico_City`);
    if(!response.ok){
        throw new Error(response.status);
    }
    let json = await response.json();
    console.log(json)
    return json;
    */
    /*http.get("http://worldtimeapi.org/api/timezone/America/Mexico_City", res =>{
        let data = ""
        res.on("data", d => {
          data += d
        });
        res.on("end", () => {
            var json = JSON.parse(data);
            valor = generaResult(json);
            //console.log(json)
          //Llamar a un Callback o resolver la promera aquí.
        });
    })
    */