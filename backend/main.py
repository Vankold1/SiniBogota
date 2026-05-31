from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from pathlib import Path
import joblib
import pandas as pd
import re
import uvicorn


# ============================================================
# Configuración inicial
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_PATH = BASE_DIR / "artifacts" / "sinibogota_xgb_artifacts.joblib"

artifacts = joblib.load(ARTIFACT_PATH)

app = FastAPI(
    title="SiniBogotá API",
    description="API para estimar la probabilidad de gravedad de un siniestro vial en Bogotá.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Luego se puede restringir al dominio de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Modelo de entrada
# ============================================================

class PredictionRequest(BaseModel):
    variables: Dict[str, Any]


# ============================================================
# Funciones auxiliares
# ============================================================

def limpiar_nombre_columna(col):
    col = str(col)
    col = re.sub(r"[\[\]<>]", "_", col)
    col = re.sub(r"\s+", "_", col)
    return col


def preparar_entrada_para_xgboost(input_data, artifacts):
    feature_columns = artifacts["feature_columns"]
    raw_input_columns = artifacts["raw_input_columns"]
    cat_cols = artifacts["cat_cols"]
    cols_binarias = artifacts["cols_binarias"]
    cols_categoricas_codificadas = artifacts["cols_categoricas_codificadas"]
    default_values = artifacts["default_values"]

    fila = default_values.copy()

    for key, value in input_data.items():
        if key in fila:
            fila[key] = value

    df_user = pd.DataFrame([fila])
    df_user = df_user.reindex(columns=raw_input_columns)

    for col in cols_binarias:
        if col in df_user.columns:
            if df_user[col].dtype == "object":
                df_user[col] = (
                    df_user[col]
                    .astype(str)
                    .str.strip()
                    .str.upper()
                    .map({"SI": 1, "NO": 0, "1": 1, "0": 0})
                    .fillna(0)
                )
            else:
                df_user[col] = pd.to_numeric(df_user[col], errors="coerce").fillna(0)

    for col in cols_categoricas_codificadas:
        if col in df_user.columns:
            df_user[col] = df_user[col].astype("object")

    for col in cat_cols:
        if col in df_user.columns:
            df_user[col] = df_user[col].astype("object")

    df_encoded = pd.get_dummies(
        df_user,
        columns=cat_cols,
        drop_first=True
    )

    bool_cols = df_encoded.select_dtypes(include=["bool"]).columns
    df_encoded[bool_cols] = df_encoded[bool_cols].astype(int)

    df_encoded.columns = [
        limpiar_nombre_columna(col)
        for col in df_encoded.columns
    ]

    df_encoded = df_encoded.reindex(
        columns=feature_columns,
        fill_value=0
    )

    for col in df_encoded.columns:
        df_encoded[col] = pd.to_numeric(df_encoded[col], errors="coerce")

    df_encoded = df_encoded.fillna(0)

    return df_encoded


def asignar_nivel_prioridad(probabilidad_grave):
    if probabilidad_grave >= 0.75:
        return "Alta"
    elif probabilidad_grave >= 0.50:
        return "Media"
    else:
        return "Baja"


# ============================================================
# Endpoints
# ============================================================

@app.get("/")
def home():
    return {
        "mensaje": "API de SiniBogotá activa",
        "modelo": "XGBoost",
        "objetivo": "Clasificación binaria de gravedad del siniestro",
        "umbral": artifacts["threshold"]
    }


@app.get("/metadata")
def get_metadata():
    return {
        "raw_input_columns": artifacts["raw_input_columns"],
        "feature_columns_count": len(artifacts["feature_columns"]),
        "threshold": artifacts["threshold"],
        "target": artifacts["target"],
        "positive_class_label": artifacts["positive_class_label"],
        "negative_class_label": artifacts["negative_class_label"],
        "cat_cols": artifacts["cat_cols"],
        "cols_binarias": artifacts["cols_binarias"],
        "cols_categoricas_codificadas": artifacts["cols_categoricas_codificadas"],
        "default_values": artifacts["default_values"]
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    input_data = request.variables

    X_user = preparar_entrada_para_xgboost(input_data, artifacts)

    proba_grave = float(artifacts["model"].predict_proba(X_user)[0, 1])
    threshold = float(artifacts["threshold"])
    pred_binaria = int(proba_grave >= threshold)

    return {
        "prediccion_binaria": pred_binaria,
        "prediccion_texto": "Grave" if pred_binaria == 1 else "No grave",
        "probabilidad_grave": proba_grave,
        "probabilidad_no_grave": 1 - proba_grave,
        "umbral": threshold,
        "nivel_prioridad": asignar_nivel_prioridad(proba_grave),
        "shape_modelo": list(X_user.shape)
    }