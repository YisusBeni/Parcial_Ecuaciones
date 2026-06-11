const grid = document.getElementById("grid");

const filas = 20;
const columnas = 20;

let celdas = [];


// Crear cuadrícula

for(let i = 0; i < filas * columnas; i++){

    let celda = document.createElement("div");
    celda.classList.add("cell");
    grid.appendChild(celda);
    celdas.push(celda);
}

// Llamar a Python
function iniciarSimulacion(){
    fetch("/lluvia")

    .then(respuesta => respuesta.json())

    .then(datos => {
        dibujar(datos);

        setInterval(()=>{
            fetch("/actualizar")

            .then(r=>r.json())

            .then(datos=>{
                dibujar(datos);
            })
        },500);
    });
}




function dibujar(datos){

    let contador = 0;

    for(let i=0;i<filas;i++){

        for(let j=0;j<columnas;j++){
            let agua = datos[i][j].agua;
        if(agua > 100){
            celdas[contador].style.backgroundColor="#0033cc";
        }
        else if(agua > 30){
            celdas[contador].style.backgroundColor="#3399ff";
        }
        else if(agua > 1){
            celdas[contador].style.backgroundColor="#99ddff";
        }
        else{
            celdas[contador].style.backgroundColor="#2ecc71";
        }
            contador++;
        }
    }
}