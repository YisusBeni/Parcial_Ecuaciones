import requests
import random
filas = 20
columnas = 20
tiempo = 0
temperatura_inicial = 25
def crear_mapa():
    mapa = []
    for i in range(filas):
        fila = []
        for j in range(columnas):
            celda = {
                "agua":0,
                "temperatura": temperatura_inicial,
                "altura": random.randint(1,10),
                "riesgo": "bajo"
            }
            fila.append(celda)
        mapa.append(fila)
    return mapa

def agregar_lluvia(mapa):

    x = random.randint(0, filas-1)
    y = random.randint(0, columnas-1)
    altura = mapa[x][y]["altura"]
    agua = (10 - altura) * 20
    if agua < 0:
        agua = 0
    mapa[x][y]["agua"] += agua
    return mapa

def crear_copia(mapa):
    copia=[]
    for fila in mapa:
        nueva=[]
        for celda in fila:
            nueva.append({
                "agua":celda["agua"],
                "temperatura":celda["temperatura"],
                "riesgo":celda.get("riesgo","normal")
            })
        copia.append(nueva)
    return copia

def mover_agua(mapa):
    filas = len(mapa)
    columnas = len(mapa[0])
    nuevo = crear_copia(mapa)
    for i in range(filas):
        for j in range(columnas):
            agua_actual = mapa[i][j]["agua"]
            if agua_actual > 0:
                cantidad = agua_actual * 0.10
                vecinos = [
                    (i-1,j),
                    (i+1,j),
                    (i,j-1),
                    (i,j+1)
                ]
                validos = []
                for x,y in vecinos:
                    if x>=0 and x<filas and y>=0 and y<columnas:
                        validos.append((x,y))
                if len(validos)>0:
                    reparto = cantidad / len(validos)
                    for x,y in validos:
                        nuevo[x][y]["agua"] += reparto
                        nuevo[i][j]["agua"] -= cantidad
    return nuevo

def calentar_zona(mapa):
    x = random.randint(0, filas-1)
    y = random.randint(0, columnas-1)
    mapa[x][y]["temperatura"] = random.randint(70,100)
    return mapa

def difundir_calor(mapa):
    nuevo_mapa = crear_mapa()
    for i in range(filas):
        for j in range(columnas):
            temperatura_actual = mapa[i][j]["temperatura"]
            vecinos = []
            if i > 0:
                vecinos.append(mapa[i-1][j]["temperatura"])
            if i < filas-1:
                vecinos.append(mapa[i+1][j]["temperatura"])
            if j > 0:
                vecinos.append(mapa[i][j-1]["temperatura"])
            if j < columnas-1:
                vecinos.append(mapa[i][j+1]["temperatura"])
            if vecinos:
                promedio = sum(vecinos) / len(vecinos)
                nueva_temperatura = temperatura_actual + 0.25 * (
                    promedio - temperatura_actual
                )
            else:
                nueva_temperatura = temperatura_actual
            nuevo_mapa[i][j]["temperatura"] = nueva_temperatura
            # conservar agua
            nuevo_mapa[i][j]["agua"] = mapa[i][j]["agua"]
    return nuevo_mapa

def calcular_riesgo(mapa):
    for i in range(filas):
        for j in range(columnas):
            agua = mapa[i][j]["agua"]
            temperatura = mapa[i][j]["temperatura"]
            if agua > 100 and temperatura > 50:
                mapa[i][j]["riesgo"] = "critico"
            elif agua > 50:
                mapa[i][j]["riesgo"] = "inundacion"

            elif temperatura > 40:
                mapa[i][j]["riesgo"] = "calor"
            else:
                mapa[i][j]["riesgo"] = "bajo"
    return mapa

def avanzar_tiempo():
    global tiempo
    tiempo += 1
    return tiempo

def obtener_clima():

    lat = 10.9685
    lon = -74.7813
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,rain"
    )
    respuesta = requests.get(url)
    datos = respuesta.json()
    temperatura = datos["current"]["temperature_2m"]
    lluvia = datos["current"]["rain"]
    return {
        "temperatura": temperatura,
        "lluvia": lluvia
    }

def simular_clima_real(mapa):
    clima = obtener_clima()
    lluvia = clima["lluvia"]
    temperatura = clima["temperatura"]
    # Aplicar temperatura a todo el mapa
    for i in range(filas):
        for j in range(columnas):
            mapa[i][j]["temperatura"] = temperatura

    # Si hay lluvia, generar agua

    if lluvia > 0:
        x = random.randint(0, filas-1)
        y = random.randint(0, columnas-1)
        mapa[x][y]["agua"] += lluvia * 20
    return mapa

def reiniciar_mapa():

    global mapa
    mapa = crear_mapa()
    return mapa