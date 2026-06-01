import json
from pathlib import Path

input_path = Path("C:\\Users\\Laura\\Documents\\SI_Proyecto\\SiniBogota\\frontend\\public\\data\\localidades_bogota.geojson")
output_path = Path("C:\\Users\\Laura\\Documents\\SI_Proyecto\\SiniBogota\\frontend\\public\\data\\localidades_bogota_leaflet.geojson")

with open(input_path, "r", encoding="utf-8") as f:
    esri_data = json.load(f)

features_geojson = []

for feature in esri_data["features"]:
    attributes = feature["attributes"]
    geometry = feature["geometry"]

    codigo = int(attributes["LocCodigo"])
    nombre = attributes["LocNombre"]

    geojson_feature = {
        "type": "Feature",
        "properties": {
            "codigo": codigo,
            "nombre": nombre,
            "loc_codigo_original": attributes["LocCodigo"],
            "objectid": attributes.get("OBJECTID"),
            "area": attributes.get("LocArea")
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": geometry["rings"]
        }
    }

    features_geojson.append(geojson_feature)

geojson_data = {
    "type": "FeatureCollection",
    "features": features_geojson
}

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(geojson_data, f, ensure_ascii=False)

print(f"Archivo convertido guardado en: {output_path}")
print(f"Número de localidades: {len(features_geojson)}")