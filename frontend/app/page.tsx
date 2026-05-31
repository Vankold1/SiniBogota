"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Activity,
  Loader2,
} from "lucide-react";

import {
  localidades,
  diasSemana,
  clasesSiniestro,
  disenosLugar,
  condicionesActor,
  clasesVehiculo,
  serviciosVehiculo,
  modalidadesVehiculo,
} from "@/lib/options";

type ResultadoPrediccion = {
  prediccion_binaria: number;
  prediccion_texto: string;
  probabilidad_grave: number;
  probabilidad_no_grave: number;
  umbral: number;
  nivel_prioridad: string;
  shape_modelo: number[];
};

export default function Home() {
  const [formData, setFormData] = useState({
    HORA: 18,
    CLASE_SINIESTRO: "ATROPELLO",
    CODIGO_LOCALIDAD: 8,
    DISENO_LUGAR: "TRAMO DE VIA",

    precip_promedio_bogota: 0,
    precip_max_bogota: 0,
    precip_min_bogota: 0,
    num_estaciones_reporte: 0,
    num_estaciones_lluvia: 0,
    pct_estaciones_lluvia: 0,

    Dia_Semana: "VIERNES",
    Festivo: 0,
    Dia_sin_carro: 0,
    Hubo_Protesta: 0,
    Es_COVID: 0,
    Hay_Evento: 0,

    num_actores: 2,
    edad_promedio_actor: 35,
    edad_min_actor: 20,
    edad_max_actor: 60,
    num_hombres: 1,
    num_mujeres: 1,

    condicion_principal: "PEATON",
    num_vehiculos: 1,
    CLASE_VEHICULO_PRINCIPAL: "AUTOMOVIL",
    servicio_principal: "PARTICULAR",
    modalidad_principal: "SIN INFORMACION",
    num_en_fuga: 0,

    codigo_causa_principal: 157,
    num_causas_registradas: 1,

    mes: 5,
    dia_mes: 30,
    anio: 2020,
    dia_anio: 151,
  });

  const [resultado, setResultado] = useState<ResultadoPrediccion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const actualizarCampo = (campo: string, valor: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const predecir = async () => {
    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener la predicción.");
      }

      const data = await response.json();
      setResultado(data);
    } catch (err) {
      setError(
        "No se pudo conectar con la API. Verifica que el backend esté corriendo en http://127.0.0.1:8000."
      );
    } finally {
      setCargando(false);
    }
  };

  const localidadSeleccionada = localidades.find(
    (loc) => loc.value === Number(formData.CODIGO_LOCALIDAD)
  );

  const probabilidadPorcentaje = resultado
    ? (resultado.probabilidad_grave * 100).toFixed(1)
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            SiniBogotá
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">
            Priorización de gravedad vial en Bogotá
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Herramienta interactiva para estimar la probabilidad de que un
            siniestro vial sea grave, a partir de variables espaciales,
            temporales, climáticas y características del evento.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5 text-cyan-300" />
              Escenario del siniestro
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Localidad"
                value={formData.CODIGO_LOCALIDAD}
                onChange={(value) =>
                  actualizarCampo("CODIGO_LOCALIDAD", Number(value))
                }
                options={localidades}
              />

              <NumberField
                label="Hora del día"
                value={formData.HORA}
                min={0}
                max={23}
                onChange={(value) => actualizarCampo("HORA", value)}
              />

              <SelectField
                label="Clase de siniestro"
                value={formData.CLASE_SINIESTRO}
                onChange={(value) =>
                  actualizarCampo("CLASE_SINIESTRO", value)
                }
                options={clasesSiniestro.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <SelectField
                label="Diseño del lugar"
                value={formData.DISENO_LUGAR}
                onChange={(value) => actualizarCampo("DISENO_LUGAR", value)}
                options={disenosLugar.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <SelectField
                label="Día de la semana"
                value={formData.Dia_Semana}
                onChange={(value) => actualizarCampo("Dia_Semana", value)}
                options={diasSemana.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <SelectField
                label="Condición principal"
                value={formData.condicion_principal}
                onChange={(value) =>
                  actualizarCampo("condicion_principal", value)
                }
                options={condicionesActor.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <NumberField
                label="Número de actores"
                value={formData.num_actores}
                min={1}
                max={20}
                onChange={(value) => actualizarCampo("num_actores", value)}
              />

              <NumberField
                label="Edad promedio de actores"
                value={formData.edad_promedio_actor}
                min={0}
                max={110}
                onChange={(value) =>
                  actualizarCampo("edad_promedio_actor", value)
                }
              />

              <NumberField
                label="Número de vehículos"
                value={formData.num_vehiculos}
                min={0}
                max={20}
                onChange={(value) => actualizarCampo("num_vehiculos", value)}
              />

              <SelectField
                label="Vehículo principal"
                value={formData.CLASE_VEHICULO_PRINCIPAL}
                onChange={(value) =>
                  actualizarCampo("CLASE_VEHICULO_PRINCIPAL", value)
                }
                options={clasesVehiculo.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <SelectField
                label="Servicio del vehículo"
                value={formData.servicio_principal}
                onChange={(value) =>
                  actualizarCampo("servicio_principal", value)
                }
                options={serviciosVehiculo.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <SelectField
                label="Modalidad"
                value={formData.modalidad_principal}
                onChange={(value) =>
                  actualizarCampo("modalidad_principal", value)
                }
                options={modalidadesVehiculo.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <NumberField
                label="Precipitación promedio"
                value={formData.precip_promedio_bogota}
                min={0}
                max={100}
                step={0.1}
                onChange={(value) =>
                  actualizarCampo("precip_promedio_bogota", value)
                }
              />

              <NumberField
                label="Causa principal"
                value={formData.codigo_causa_principal}
                min={0}
                max={999}
                onChange={(value) =>
                  actualizarCampo("codigo_causa_principal", value)
                }
              />

              <ToggleField
                label="¿Es festivo?"
                value={formData.Festivo}
                onChange={(value) => actualizarCampo("Festivo", value)}
              />

              <ToggleField
                label="¿Hubo protesta?"
                value={formData.Hubo_Protesta}
                onChange={(value) => actualizarCampo("Hubo_Protesta", value)}
              />
            </div>

            <button
              onClick={predecir}
              disabled={cargando}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {cargando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Calculando...
                </>
              ) : (
                "Estimar gravedad"
              )}
            </button>

            {error && (
              <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5 text-cyan-300" />
                Zona seleccionada
              </h2>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">Localidad</p>
                <p className="mt-1 text-3xl font-bold">
                  {localidadSeleccionada?.label}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Código enviado al modelo: {formData.CODIGO_LOCALIDAD}
                </p>
              </div>

              <div className="mt-5 flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-center text-sm text-slate-400">
                Aquí luego podemos agregar el mapa de Bogotá por localidades.
                Por ahora se muestra la localidad seleccionada.
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
              <h2 className="mb-4 text-xl font-semibold">
                Resultado del modelo
              </h2>

              {!resultado ? (
                <p className="text-slate-400">
                  Completa el escenario y ejecuta la predicción para visualizar
                  la probabilidad estimada.
                </p>
              ) : (
                <div>
                  <div
                    className={`mb-4 flex items-center gap-3 rounded-2xl p-4 ${
                      resultado.prediccion_texto === "Grave"
                        ? "bg-red-500/10 text-red-200"
                        : "bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {resultado.prediccion_texto === "Grave" ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                    <div>
                      <p className="text-sm opacity-80">Predicción</p>
                      <p className="text-2xl font-bold">
                        {resultado.prediccion_texto}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-400">
                    Probabilidad estimada de gravedad
                  </p>
                  <p className="mt-1 text-5xl font-bold">
                    {probabilidadPorcentaje}%
                  </p>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${probabilidadPorcentaje}%`,
                      }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <InfoCard
                      label="Nivel de prioridad"
                      value={resultado.nivel_prioridad}
                    />
                    <InfoCard
                      label="Umbral"
                      value={resultado.umbral.toFixed(2)}
                    />
                    <InfoCard
                      label="Columnas modelo"
                      value={resultado.shape_modelo.join(" × ")}
                    />
                    <InfoCard
                      label="No grave"
                      value={`${(resultado.probabilidad_no_grave * 100).toFixed(
                        1
                      )}%`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-4xl text-sm text-slate-400">
          Nota: este modelo no predice la ocurrencia de un siniestro antes de
          que suceda. Estima la probabilidad de gravedad bajo un escenario de
          siniestro definido por el usuario, por lo que se orienta a análisis,
          caracterización y priorización de atención.
        </p>
      </section>
    </main>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300"
      >
        {options.map((option) => (
          <option key={`${option.label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300"
      />
    </label>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none"
      >
        <option value={0}>No</option>
        <option value={1}>Sí</option>
      </select>
    </label>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-100">{value}</p>
    </div>
  );
}