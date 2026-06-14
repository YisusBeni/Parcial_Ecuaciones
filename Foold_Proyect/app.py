from flask import Flask, render_template, jsonify

from simulation import (
    crear_mapa,
    agregar_lluvia,
    mover_agua,
    calentar_zona,
    difundir_calor,
    calcular_riesgo
)

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



if __name__ == "__main__":

    app.run(debug=True)