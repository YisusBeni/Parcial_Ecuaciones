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
                "agua": 0
            }

            fila.append(celda)

        mapa.append(fila)
    return mapa

def agregar_lluvia(mapa):

    x = random.randint(0, filas-1)
    y = random.randint(0, columnas-1)

    mapa[x][y]["agua"] += 500
    return mapa

# Propagación del agua

def mover_agua(mapa):

    nuevo_mapa = crear_mapa()


    for i in range(filas):

        for j in range(columnas):

            agua_actual = mapa[i][j]["agua"]
            # conservar agua
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
                    nuevo_mapa[x][y]["agua"] += cantidad

    return nuevo_mapa
