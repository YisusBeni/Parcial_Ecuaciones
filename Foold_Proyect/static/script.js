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
let nivelAgua = 0;
let intervaloSimulacion = null;
let zonas = [];
let zonasRiesgo = [];
let climaActual = {
    temperatura:0,
    lluvia:0
};

fetch("static/zonas.geojson")
.then(res=>res.json())
.then(data=>{
    let capa = L.geoJSON(data,{
        style:function(feature){
            let color="green";
            if(feature.properties.riesgo=="medio"){
                color="orange";
            }
            if(feature.properties.riesgo=="alto"){
                color="red";
            }
            return{
                color:color,
                fillColor:color,
                fillOpacity:0.5
            };
        },
        onEachFeature:function(feature,layer){
            layer.bindPopup(
                "<b>"+feature.properties.nombre+"</b><br>"+
                "Riesgo inicial: "+
                feature.properties.riesgo
            );
            zonas.push({
                id: feature.properties.id,
                nombre: feature.properties.nombre,
                capa: layer
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
    nivelAgua += 1;
    zonas.forEach(z=>{
        let altura =
        z.feature.properties.altura;
        if(nivelAgua > altura){
            z.setStyle({
            color:"blue",
            fillColor:"blue"
            });
        }
        else{
            z.setStyle({
            color:"green",
            fillColor:"green"
            });
        }
        z.bindPopup(
        z.feature.properties.nombre+
        "<br>Nivel agua: "+
        nivelAgua+
        "<br>Altura terreno: "+
        altura
        );
    });
}

function iniciarInundacion(){
    nivelAgua = 0;
    if(intervaloInundacion != null){
        clearInterval(intervaloInundacion);
    }
    intervaloInundacion = setInterval(()=>{
        simularInundacionReal();
    },2000);
}
