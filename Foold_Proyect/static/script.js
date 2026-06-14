const grid = document.getElementById("grid");

const filas = 20;
const columnas = 20;

let celdas = [];
let intervaloSimulacion = null;

// Crear cuadrícula

for(let i = 0; i < filas * columnas; i++){

    let celda = document.createElement("div");
    celda.title = "Zona ambiental";
    celda.classList.add("cell");
    grid.appendChild(celda);
    celdas.push(celda);
}

// Llamar a Python
function iniciarSimulacion(){
    detenerSimulacion();
    fetch("/lluvia")
    .then(res => res.json())
    .then(datos => {
        dibujar(datos);
        intervaloSimulacion = setInterval(()=>{
            fetch("/actualizar")
            .then(r => r.json())
            .then(datos=>{
                dibujar(datos);
            });
        },1000);
    });
}

function dibujar(datos){

    let contador = 0;
    for(let i=0;i<filas;i++){
        for(let j=0;j<columnas;j++){
            let agua = datos[i][j].agua;
            let temperatura = datos[i][j].temperatura;
            let riesgo = datos[i][j].riesgo;
            let altura = datos[i][j].altura;
            if(riesgo == "critico"){
                celdas[contador].style.backgroundColor = "purple";
            }
            else if(riesgo == "inundacion"){
                celdas[contador].style.backgroundColor = "#0033cc";
            }
            else if(riesgo == "calor"){
                celdas[contador].style.backgroundColor = "red";
            }
            else if(agua > 1){
                celdas[contador].style.backgroundColor = "#99ddff";
            }
            else{
                celdas[contador].style.backgroundColor = "#2ecc71";
            }

            celdas[contador].title =
            "Agua: " + agua.toFixed(1) +
            "\nTemperatura: " + temperatura.toFixed(1) +
            "°C" +
            "\nAltura: " + altura +
            "\nRiesgo: " + riesgo;
            contador++;
        }
    }
}

function simularTemperatura(){

    detenerSimulacion();
    fetch("/calor")
    .then(r => r.json())
    .then(datos=>{
        dibujarTemperatura(datos);
        intervaloSimulacion = setInterval(()=>{
            fetch("/temperatura")
            .then(r=>r.json())
            .then(datos=>{
                dibujarTemperatura(datos);
            });
        },1000);
    });
}

function dibujarTemperatura(datos){

    let contador = 0;
    for(let i=0;i<filas;i++){
        for(let j=0;j<columnas;j++){
            let temp = datos[i][j].temperatura;
            if(temp > 60){
                celdas[contador].style.backgroundColor="red";
            }
            else if(temp > 35){
                celdas[contador].style.backgroundColor="orange";
            }
            else{
                celdas[contador].style.backgroundColor="green";
            }

            celdas[contador].title =
            "Temperatura: " + temp.toFixed(1) + "°C";

            contador++;
        }
    }
}

function detenerSimulacion(){

    if(intervaloSimulacion != null){
        clearInterval(intervaloSimulacion);
        intervaloSimulacion = null;
    }
}

function verRiesgo(){

    fetch("/riesgo")
    .then(res => res.json())
    .then(datos => {
        dibujar(datos);
    });
}