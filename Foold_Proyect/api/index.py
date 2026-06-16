from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Proyecto de inundaciones funcionando 🚀"