let map = L.map('map').setView(
    [10.9685,-74.7813],
    12
);


L.tileLayer(
'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
{
    attribution:'OpenStreetMap'
}
).addTo(map);
let intervaloSimulacion = null;
let zonasRiesgo = [];
let intervaloInundacion = null;
let nivelAgua = 0;
let intensidadLluvia = 1;
let lluviaSimulada = 0;
let zonas = [];
let aguaZonas = {
    "Norte":0,
    "Centro":0,
    "Sur":0
};

let climaActual = {
    temperatura:0,
    lluvia:0
};

fetch("static/zonas.geojson")
    .then(res=>res.json())
    .then(data=>{
        let capa = L.geoJSON(data,{
            style:function(feature){
                return {
                    color:"green",
                    fillColor:"green",
                    fillOpacity:0.5
                };
            },
            onEachFeature:function(feature,layer){
                layer.feature = feature;
                layer.bindPopup(
                    feature.properties.nombre
                );
                zonas.push({
                    capa:layer,
                    feature:feature
                });
            }
        }).addTo(map);
        map.fitBounds(capa.getBounds());
    });

function resetearMapaVisual(){
    zonas.forEach(z=>{
        z.capa.setStyle({
            color:"green",
            fillColor:"green"
        });
    });
}

// Llamar a Python
function iniciarSimulacion(){
    detenerSimulacion();
    resetearMapaVisual();
    obtenerClimaActual();
    fetch("/reiniciar")
    .then(r=>r.json())
    .then(()=>{
        fetch("/lluvia")
        .then(res=>res.json())
        .then(datos=>{
            dibujar(datos);
            actualizarMapa(datos);
            intervaloSimulacion=setInterval(()=>{
                fetch("/actualizar")
                .then(r=>r.json())
                .then(datos=>{
                    dibujar(datos);
                    actualizarMapa(datos);
                });
            },1000);
        });
    });
}

function dibujar(datos){
    actualizarMapa(datos);
}

function simularTemperatura(){
    detenerSimulacion();
    resetearMapaVisual();
    obtenerClimaActual();
    fetch("/reiniciar")
    .then(r=>r.json())
    .then(()=>{
        fetch("/calor")
        .then(r=>r.json())
        .then(datos=>{
            dibujarTemperatura(datos);
            actualizarMapa(datos);
        });
    });
}

function dibujarTemperatura(datos){
    actualizarMapa(datos);
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
        actualizarMapa(datos);
    });
}

function actualizarTiempo(){

    fetch("/tiempo")
    .then(res=>res.json())
    .then(datos=>{
        document.getElementById("reloj").innerHTML =
        "Hora simulada: " + datos.hora;
    });
}

function simularClimaReal(){

    fetch("/simular_clima")
    .then(res=>res.json())
    .then(datos=>{
        dibujar(datos);
        actualizarMapa(datos);
    });
}

function actualizarMapa(datos){
    zonas.forEach(z=>{
        let aguaTotal = 0;
        let temperaturaTotal = 0;
        let cantidad = 0;
        let inicioFila = 0;
        let finFila = 0;
        // dividir mapa en sectores
        if(z.id == 1){
            inicioFila = 0;
            finFila = 6;
        }
        if(z.id == 2){
            inicioFila = 7;
            finFila = 13;
        }
        if(z.id == 3){
            inicioFila = 14;
            finFila = 19;
        }
        for(let i=inicioFila;i<=finFila;i++){
            console.log(datos[i][0]);
            for(let j=0;j<datos[i].length;j++){
                aguaTotal += Number(datos[i][j].agua);
                temperaturaTotal += Number(datos[i][j].temperatura);
                cantidad++;
            }
        }
        let aguaPromedio =
        aguaTotal / cantidad;
        let temperaturaPromedio =
        temperaturaTotal / cantidad;
        let color="green";
        let temperaturaFinal=(climaActual.temperatura + temperaturaPromedio) / 2;
        let lluviaFinal=aguaPromedio + climaActual.lluvia;
        if(lluviaFinal > 80 && temperaturaFinal > 35){
            color="purple";
        }
        else if(lluviaFinal > 30){
            color="blue";
        }
        else if(temperaturaFinal > 35){
            color="red";
        }
        z.capa.setStyle({
            color:color,
            fillColor:color,
            fillOpacity:0.5
        });
        z.capa.bindPopup(

        "<b>"+z.nombre+"</b><br>"+

        "Agua promedio: "+
        aguaPromedio.toFixed(2)+
        "<br>"+

        "Temperatura zona: "+
        temperaturaPromedio.toFixed(2)+
        "°C<br>"+

        "Temperatura real: "+
        climaActual.temperatura+
        "°C<br>"+

        "Lluvia real: "+
        climaActual.lluvia+
        " mm<br>"+

        "Riesgo: "+
        color

        );
    });
    zonasRiesgo.forEach(z=>{
        map.removeLayer(z);
    });
    zonasRiesgo=[];
    zonas.forEach(z=>{
        if(z.capa.options.fillColor=="blue"){
            let centro = z.capa.getBounds().getCenter();
            crearZonaRiesgo(
                centro.lat,
                centro.lng,
                "blue"
            );
        }
    });
}

function obtenerClimaActual(){
    fetch("/clima_actual")
    .then(res=>res.json())
    .then(datos=>{
        climaActual.temperatura = datos.temperatura;
        fetch("/actualizar_temperatura/"+datos.temperatura);
        climaActual.lluvia = datos.lluvia;
        if(datos.lluvia > 10){
            intensidadLluvia = 3;
        }

        else if(datos.lluvia > 0){
            intensidadLluvia = 2;

        }
        else{
            intensidadLluvia = 1;
        }
        document.getElementById("clima").innerHTML ="Temperatura actual: "+
        datos.temperatura+"°C<br>"+"Humedad: "+
        datos.humedad+"%<br>"+"Lluvia: "+
        datos.lluvia+" mm";
    });
}

function crearZonaRiesgo(lat,lon,color){
    let zona = L.circle(
        [lat,lon],
        {
            radius:300,
            color:color,
            fillColor:color,
            fillOpacity:0.5
        }
    ).addTo(map);
    zonasRiesgo.push(zona);
}

function simularInundacionReal(){
    // lluvia cae primero en la zona baja
    aguaZonas["Sur"] += 2;
    // desplazamiento del agua
    if(aguaZonas["Sur"] > 5){
        let transferencia =
        aguaZonas["Sur"] * 0.20;
        aguaZonas["Sur"] -= transferencia;
        aguaZonas["Centro"] += transferencia;
    }
    if(aguaZonas["Centro"] > 5){
        let transferencia =
        aguaZonas["Centro"] * 0.15;
        aguaZonas["Centro"] -= transferencia;
        aguaZonas["Norte"] += transferencia;
    }

    console.log(aguaZonas);
    zonas.forEach(z=>{
        let nombre =z.feature.properties.nombre;
        let agua =aguaZonas[nombre];
        let altura =z.feature.properties.altura;
        let color="green";
        if(agua >= altura + 5){
            color="purple";
        }
        else if(agua >= altura){
            color="blue";
        }
        else if(agua > 0){
            color="yellow";
        }

        z.capa.setStyle({
            color:color,
            fillColor:color,
            fillOpacity:0.6
        });

        z.capa.bindPopup(
        "<b>"+nombre+"</b><br>"+
        "Agua acumulada: "+
        agua.toFixed(2)+
        " mm<br>"+
        "Altura: "+
        altura+
        "<br>"+
        "Estado: "+
        color
        );
    });
}

function iniciarInundacion(){
    lluviaZona = 0;
    if(intervaloInundacion){
        clearInterval(intervaloInundacion);
    }
    intervaloInundacion = setInterval(()=>{
        simularInundacionReal();
    },2000);
}

function agregarLluvia(){
    lluviaSimulada += 5;
    intensidadLluvia = lluviaSimulada / 5;
    console.log(
        "Lluvia simulada:",
        lluviaSimulada,
        "mm"
    );
}