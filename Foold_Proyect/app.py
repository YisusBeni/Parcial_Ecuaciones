from flask import Flask, render_template, jsonify

from simulation import crear_mapa, agregar_lluvia, mover_agua


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



if __name__ == "__main__":

    app.run(debug=True)