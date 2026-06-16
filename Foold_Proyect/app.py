from flask import Flask, render_template, jsonify

from simulation import (
    crear_mapa,
    agregar_lluvia,
    mover_agua,
    calentar_zona,
    difundir_calor,
    calcular_riesgo,
    obtener_clima,
    simular_clima_real,
    reiniciar_mapa
)
from simulation import avanzar_tiempo

app = Flask(__name__)

mapa = crear_mapa()

@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/lluvia")
def lluvia():
    global mapa
    mapa = agregar_lluvia(mapa)
    return jsonify(mapa)

@app.route("/actualizar")
def actualizar():
    global mapa
    mapa = mover_agua(mapa)
    return jsonify(mapa)



@app.route("/calor")
def calor():

    global mapa

    mapa = calentar_zona(mapa)

    return jsonify(mapa)



@app.route("/temperatura")
def temperatura():

    global mapa

    mapa = difundir_calor(mapa)

    return jsonify(mapa)



@app.route("/riesgo")
def riesgo():

    global mapa

    mapa = calcular_riesgo(mapa)

    return jsonify(mapa)

@app.route("/tiempo")
def tiempo_simulado():
    valor = avanzar_tiempo()
    return jsonify({
        "hora": valor
    })

@app.route("/clima")
def clima():

    datos = obtener_clima()
    return jsonify(datos)

@app.route("/simular_clima")
def simulacion_clima():

    global mapa
    mapa = simular_clima_real(mapa)

    return jsonify(mapa)

@app.route("/reiniciar")
def reiniciar():

    global mapa
    mapa = reiniciar_mapa()
    return jsonify(mapa)

@app.route("/clima_actual")
def clima_actual():
    import requests
    url = "https://api.open-meteo.com/v1/forecast?latitude=10.9685&longitude=-74.7813&current=temperature_2m,relative_humidity_2m,rain"
    respuesta = requests.get(url)
    datos = respuesta.json()
    clima = {
        "temperatura":
        datos["current"]["temperature_2m"],
        "humedad":
        datos["current"]["relative_humidity_2m"],
        "lluvia":
        datos["current"]["rain"]
    }
    return jsonify(clima)

@app.route("/actualizar_temperatura/<float:temp>")
def actualizar_temperatura(temp):

    import simulation

    simulation.temperatura_inicial = temp

    return jsonify({
        "mensaje":"Temperatura actualizada",
        "temperatura":temp
    })

if __name__ == "__main__":

    app.run(debug=True)