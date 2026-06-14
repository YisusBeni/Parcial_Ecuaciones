import random
filas = 20
columnas = 20

def crear_mapa():
    mapa = []
    for i in range(filas):
        fila = []
        for j in range(columnas):
            celda = {
                "temperatura": 25,
                "agua": 0,
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

def mover_agua(mapa):
    nuevo_mapa = crear_mapa()
    for i in range(filas):
        for j in range(columnas):
            agua_actual = mapa[i][j]["agua"]
            nuevo_mapa[i][j]["agua"] += agua_actual * 0.9
            vecinos = []
            if i > 0:
                vecinos.append((i-1,j))
            if i < filas-1:
                vecinos.append((i+1,j))
            if j > 0:
                vecinos.append((i,j-1))
            if j < columnas-1:
                vecinos.append((i,j+1))
            if vecinos:
                cantidad = (agua_actual * 0.1) / len(vecinos)
                for x,y in vecinos:
                    diferencia_altura = mapa[i][j]["altura"] - mapa[x][y]["altura"]
                    if diferencia_altura > 0:
                        nuevo_mapa[x][y]["agua"] += cantidad * 1.5
                    else:
                        nuevo_mapa[x][y]["agua"] += cantidad
            nuevo_mapa[i][j]["temperatura"] = mapa[i][j]["temperatura"]
    return nuevo_mapa

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