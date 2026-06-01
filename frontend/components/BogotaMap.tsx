"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { Layer } from "leaflet";
import L from "leaflet";

type BogotaMapProps = {
  selectedLocalidad: number;
  probabilidadGrave?: number | null;
};

type LocalidadProperties = {
  codigo: number;
  nombre: string;
  loc_codigo_original: string;
  objectid?: number;
  area?: number;
};

function FitBounds({
  data,
}: {
  data: FeatureCollection<Geometry, LocalidadProperties> | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    const geojsonLayer = L.geoJSON(data);
    const bounds = geojsonLayer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [20, 20],
      });
    }
  }, [data, map]);

  return null;
}

export default function BogotaMap({
  selectedLocalidad,
  probabilidadGrave,
}: BogotaMapProps) {
  const [data, setData] =
    useState<FeatureCollection<Geometry, LocalidadProperties> | null>(null);

  useEffect(() => {
    fetch("@/public/data/localidades_bogota_leaflet.geojson")
      .then((response) => response.json())
      .then((geojson) => setData(geojson))
      .catch((error) => {
        console.error("Error cargando GeoJSON de localidades:", error);
      });
  }, []);

  const getColorLocalidad = (codigo: number) => {
    if (codigo !== selectedLocalidad) {
      return {
        fillColor: "#27272a",
        color: "#57534e",
        fillOpacity: 0.35,
        weight: 1,
      };
    }

    if (probabilidadGrave === null || probabilidadGrave === undefined) {
      return {
        fillColor: "#f97316",
        color: "#facc15",
        fillOpacity: 0.75,
        weight: 3,
      };
    }

    if (probabilidadGrave >= 0.75) {
      return {
        fillColor: "#dc2626",
        color: "#facc15",
        fillOpacity: 0.85,
        weight: 4,
      };
    }

    if (probabilidadGrave >= 0.5) {
      return {
        fillColor: "#f97316",
        color: "#facc15",
        fillOpacity: 0.8,
        weight: 4,
      };
    }

    return {
      fillColor: "#facc15",
      color: "#f97316",
      fillOpacity: 0.75,
      weight: 4,
    };
  };

  const styleFeature = (feature?: Feature<Geometry, LocalidadProperties>) => {
    const codigo = feature?.properties?.codigo;
    return getColorLocalidad(Number(codigo));
  };

  const onEachFeature = (
    feature: Feature<Geometry, LocalidadProperties>,
    layer: Layer
  ) => {
    const nombre = feature.properties.nombre;
    const codigo = feature.properties.codigo;
    const seleccionada = codigo === selectedLocalidad;

    layer.bindTooltip(
      `${nombre}${seleccionada ? " — localidad seleccionada" : ""}`,
      {
        sticky: true,
      }
    );
  };

  return (
    <div className="h-80 overflow-hidden rounded-2xl border border-orange-500/20">
      <MapContainer
        center={[4.65, -74.1]}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data && (
          <>
            <GeoJSON
              key={`${selectedLocalidad}-${probabilidadGrave ?? "sin-prob"}`}
              data={data}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
            <FitBounds data={data} />
          </>
        )}
      </MapContainer>
    </div>
  );
}