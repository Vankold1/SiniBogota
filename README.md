# SiniBogotá

SiniBogotá es una aplicación de análisis y priorización de gravedad de siniestros viales en Bogotá. El proyecto integra datos históricos de siniestros, variables espaciales, temporales, climáticas y características del evento para estimar la probabilidad de que un siniestro vial sea grave. El sistema no predice la ocurrencia de un accidente antes de que suceda. Su unidad de análisis es el siniestro registrado o simulado por el usuario. Por esta razón, la aplicación se orienta a la caracterización, consulta interactiva y priorización de atención de eventos viales, permitiendo explorar cómo cambia la probabilidad de gravedad según localidad, hora, tipo de siniestro, condiciones climáticas, actores involucrados y demás variables del evento.

## Aplicación desplegada

La aplicación web está disponible en:

```text
https://sini-bogota.vercel.app
```

El backend de predicción está desplegado en Render:

```text
https://sinibogota.onrender.com
```

## Objetivo del proyecto

El objetivo principal del proyecto es construir un sistema basado en aprendizaje automático que permita clasificar la gravedad de un siniestro vial en Bogotá. La variable objetivo utilizada es `GRAVEDAD_BIN`, donde:

* `1`: siniestro grave.
* `0`: siniestro no grave.

La herramienta busca apoyar el análisis de condiciones asociadas a mayor severidad y facilitar la visualización de zonas de atención mediante una interfaz interactiva con mapa de localidades de Bogotá.

## Modelos desarrollados

Durante el proyecto se implementaron y compararon tres enfoques principales de clasificación:

1. **Regresión Logística**
   Modelo base utilizado como referencia por su interpretabilidad y simplicidad.

2. **Multilayer Perceptron (MLP)**
   Red neuronal multicapa utilizada para capturar relaciones no lineales entre las variables del siniestro.

3. **XGBoost**
   Modelo de ensamble basado en boosting de árboles de decisión. Fue seleccionado como modelo final debido a su buen desempeño predictivo, estabilidad y capacidad para manejar datos tabulares con variables categóricas, numéricas, espaciales, temporales y climáticas.

El modelo XGBoost final fue exportado y conectado con la aplicación web para realizar predicciones en tiempo real desde la interfaz.

## Modelo final desplegado

El modelo desplegado corresponde a un clasificador XGBoost entrenado sobre las variables finales procesadas del dataset de SiniBogotá. El modelo utiliza 206 columnas después del preprocesamiento y la codificación one-hot de variables categóricas.

Entre las variables consideradas se encuentran:

* Hora del siniestro.
* Clase del siniestro.
* Localidad.
* Diseño del lugar.
* Día de la semana.
* Variables climáticas de precipitación.
* Número de actores involucrados.
* Edades de los actores.
* Número de hombres y mujeres involucrados.
* Condición principal del actor.
* Número y tipo de vehículos.
* Servicio y modalidad del vehículo.
* Causa principal registrada.
* Variables de calendario y contexto urbano.

El modelo devuelve:

* Predicción binaria: grave o no grave.
* Probabilidad estimada de gravedad.
* Probabilidad estimada de no gravedad.
* Nivel de prioridad: baja, media o alta.

## Interfaz web

La aplicación permite al usuario modificar variables del escenario de siniestro mediante controles interactivos. La interfaz incluye:

* Formulario de entrada con variables espaciales, temporales, climáticas y del evento.
* Selectores con nombres descriptivos para variables codificadas, como localidad, clase de siniestro, diseño del lugar, tipo de vehículo, servicio, modalidad y causa principal.
* Cálculo automático de algunas variables derivadas, como edad promedio de los actores.
* Validación de rangos para variables numéricas.
* Visualización de la localidad seleccionada en un mapa de Bogotá.
* Resultado del modelo con probabilidad de gravedad y nivel de prioridad.

La interfaz fue desarrollada con Next.js y desplegada en Vercel.

## Backend de predicción

El backend fue desarrollado con FastAPI. Este servicio carga los artefactos exportados del modelo XGBoost y expone endpoints para consultar metadatos y ejecutar predicciones.

Endpoints principales:

```text
GET /metadata
```

Retorna información sobre las variables del modelo, columnas esperadas, variables categóricas, valores por defecto y configuración del modelo.

```text
POST /predict
```

Recibe un conjunto de variables del siniestro y retorna la predicción de gravedad.

El backend fue desplegado en Render.

## Estructura del repositorio

```text
SiniBogota/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── artifacts/
│       ├── sinibogota_xgb_artifacts.joblib
│       └── sinibogota_xgb_metadata.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   │   └── BogotaMap.tsx
│   ├── lib/
│   │   └── options.ts
│   ├── public/
│   │   └── data/
│   │       ├── localidades_bogota.geojson
│   │       └── localidades_bogota_leaflet.geojson
│   ├── package.json
│   └── ...
│
├── notebooks/
│   ├── SiniBogota_Regresion_Logistica.ipynb
│   ├── SiniBogota_MLP.ipynb
│   └── SiniBogota_XGBoost.ipynb
│
├── README.md
└── .gitignore
```

## Descripción de carpetas y archivos

### `backend/`

Contiene la API desarrollada en FastAPI. Esta API carga el modelo XGBoost exportado y permite realizar predicciones desde la aplicación web.

Archivos principales:

* `main.py`: define la API, los endpoints `/metadata` y `/predict`, y el procesamiento necesario para convertir las entradas del usuario en las columnas esperadas por el modelo.
* `requirements.txt`: lista las dependencias necesarias para ejecutar el backend.
* `artifacts/`: contiene el modelo entrenado y los metadatos necesarios para el despliegue.

### `backend/artifacts/`

Contiene los artefactos exportados desde el notebook de XGBoost:

* `sinibogota_xgb_artifacts.joblib`: archivo principal con el modelo entrenado, columnas finales, columnas originales, valores por defecto, variables categóricas y umbral de clasificación.
* `sinibogota_xgb_metadata.json`: archivo auxiliar con metadatos del modelo, columnas utilizadas, rangos numéricos y opciones categóricas.

### `frontend/`

Contiene la aplicación web desarrollada con Next.js. Esta interfaz permite al usuario construir un escenario de siniestro vial, enviarlo al backend y visualizar la probabilidad estimada de gravedad.

Elementos principales:

* `app/page.tsx`: página principal de la aplicación.
* `components/BogotaMap.tsx`: componente encargado de visualizar el mapa de localidades de Bogotá.
* `lib/options.ts`: contiene las opciones visibles para los selectores de la interfaz, incluyendo localidades, clases de siniestro, diseños del lugar, tipos de vehículo, servicios, modalidades y causas.
* `public/data/`: contiene los archivos geoespaciales usados para pintar las localidades en el mapa.

### `notebooks/`

Contiene los notebooks de experimentación y modelado. En esta carpeta se conservan únicamente los modelos principales del proyecto:

* Regresión Logística.
* MLP.
* XGBoost.

El notebook de XGBoost contiene el modelo final seleccionado y el proceso de exportación de artefactos para despliegue.

## Ejecución local

### Backend

Desde la carpeta `backend/`:

```bash
uvicorn main:app --reload
```

La API quedará disponible en:

```text
http://127.0.0.1:8000
```

Endpoint de metadatos:

```text
http://127.0.0.1:8000/metadata
```

### Frontend

Desde la carpeta `frontend/`:

```bash
npm install
npm run dev
```

La aplicación quedará disponible en:

```text
http://localhost:3000
```

Para conectar el frontend con el backend local, crear un archivo `.env.local` dentro de `frontend/` con:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Para producción, la variable debe apuntar al backend desplegado:

```env
NEXT_PUBLIC_API_URL=https://sinibogota.onrender.com
```

## Tecnologías utilizadas

* Python
* pandas
* scikit-learn
* XGBoost
* FastAPI
* Uvicorn
* Joblib
* Next.js
* React
* TypeScript
* Tailwind CSS
* Leaflet
* React Leaflet
* Vercel
* Render

## Consideraciones del modelo

El modelo actual estima la probabilidad de gravedad bajo un escenario de siniestro definido por el usuario. No estima directamente la probabilidad de ocurrencia de un accidente en un segmento vial antes de que este suceda.

Como trabajo futuro, el sistema podría extenderse hacia un modelo preventivo de ocurrencia, donde la unidad de análisis sea un segmento vial o zona geográfica en una ventana temporal determinada. Ese enfoque requeriría construir un dataset diferente, incluyendo tanto periodos o segmentos con siniestros como periodos o segmentos sin siniestros.

## Estado actual

El proyecto cuenta con:

* Dataset procesado para clasificación binaria de gravedad.
* Comparación de modelos de aprendizaje automático.
* Modelo XGBoost exportado.
* API de predicción desplegada.
* Aplicación web desplegada.
* Visualización geográfica por localidades de Bogotá.
* Interfaz interactiva para consulta de escenarios de severidad vial.
****
