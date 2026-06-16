<h1>Simulador de Inundaciones - Barranquilla</h1>
Sistema web de simulación ambiental desarrollado para representar el comportamiento de una inundación en zonas de Barranquilla mediante un mapa interactivo.

El proyecto integra datos climáticos, zonas geográficas y un modelo de acumulación y desplazamiento del agua para visualizar posibles escenarios de riesgo.

-  Mapa interactivo utilizando Leaflet y OpenStreetMap.
-  Visualización de zonas geográficas mediante GeoJSON.
-  Simulación progresiva de inundaciones.
## Tecnologías utilizadas
### Backend
- Python
- Flask
- ### Frontend
- HTML5
- CSS3
- JavaScript
- ### Mapas
- Leaflet
- OpenStreetMap
- ### Datos geográficos
- GeoJSON
- ### Instalación
- Clonar el repositorio
- pip install flask requests
- python app.py
- http://127.0.0.1:5000

<h1>Funcionamiento</h1>

El sistema representa las zonas de Barranquilla como áreas con diferentes características del terreno.

Cuando inicia la simulación:

La lluvia genera acumulación de agua.
Las zonas con menor altura reciben mayor impacto.
El agua se desplaza progresivamente hacia zonas cercanas.
El mapa cambia de color según el nivel de riesgo.
Objetivo

Crear una representación visual e interactiva de un escenario de inundación urbana que permita analizar cómo factores como lluvia, terreno y acumulación de agua pueden afectar diferentes zonas.
