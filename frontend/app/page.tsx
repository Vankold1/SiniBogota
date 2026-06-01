"use client";
import dynamic from "next/dynamic";
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
  causasPrincipales,
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

const BogotaMap = dynamic(() => import("@/components/BogotaMap"), {
  ssr: false,
});

export default function Home() {
  const [formData, setFormData] = useState({
    HORA: 18,
    CLASE_SINIESTRO: 2,
    CODIGO_LOCALIDAD: 8,
    DISENO_LUGAR: 1,

    precip_promedio_bogota: 2.1,
    precip_max_bogota: 5.6,
    precip_min_bogota: 0,
    num_estaciones_reporte: 5,
    num_estaciones_lluvia: 4,
    pct_estaciones_lluvia: 0.71,

    Dia_Semana: "Viernes",
    Festivo: 0,
    Dia_sin_carro: 0,
    Hubo_Protesta: 0,
    Es_COVID: 0,
    Hay_Evento: 0,

    num_actores: 2,
    edad_promedio_actor: 37,
    edad_min_actor: 28,
    edad_max_actor: 45,
    num_hombres: 2,
    num_mujeres: 0,

    condicion_principal: "CONDUCTOR",
    num_vehiculos: 2,
    CLASE_VEHICULO_PRINCIPAL: 1,
    servicio_principal: 3,
    modalidad_principal: 5,
    num_en_fuga: 0,

    codigo_causa_principal: 121,
    num_causas_registradas: 1,

    mes: 7,
    dia_mes: 16,
    anio: 2017,
    dia_anio: 189,
  });

  const [resultado, setResultado] = useState<ResultadoPrediccion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const actualizarCampo = (campo: string, valor: string | number) => {
    setFormData((prev) => {
      const actualizado = {
        ...prev,
        [campo]: valor,
      };

      if (campo === "edad_min_actor" || campo === "edad_max_actor") {
        const edadMin = campo === "edad_min_actor" ? Number(valor) : Number(prev.edad_min_actor);
        const edadMax = campo === "edad_max_actor" ? Number(valor) : Number(prev.edad_max_actor);
        actualizado.edad_promedio_actor = Number(((edadMin + edadMax) / 2).toFixed(1));
      }
      return actualizado;});
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

  const causaSeleccionada = causasPrincipales.find(
    (causa) => causa.value === Number(formData.codigo_causa_principal)
  );

  const probabilidadPorcentaje = resultado
    ? (resultado.probabilidad_grave * 100).toFixed(1)
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-red-950 text-orange-50">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            SiniBogotá
          </p>
          <h1 className="bg-gradient-to-r from-amber-200 via-orange-300 to-red-400 bg-clip-text text-3xl font-bold text-transparent md:text-5xl">
            Priorización de gravedad vial en Bogotá
          </h1>
          <p className="mt-4 max-w-3xl text-orange-100/80">
            Herramienta interactiva para estimar la probabilidad de que un
            siniestro vial sea grave, a partir de variables espaciales,
            temporales, climáticas y características del evento.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-orange-500/20 bg-zinc-950/80 p-6 shadow-2xl shadow-red-950/40">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5 text-amber-300" />
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
                  actualizarCampo("CLASE_SINIESTRO", Number(value))
                }
                options={clasesSiniestro}
              />

              <SelectField
                label="Diseño del lugar"
                value={formData.DISENO_LUGAR}
                onChange={(value) =>
                  actualizarCampo("DISENO_LUGAR", Number(value))
                }
                options={disenosLugar}
              />

              <SelectField
                label="Día de la semana"
                value={formData.Dia_Semana}
                onChange={(value) => actualizarCampo("Dia_Semana", value)}
                options={diasSemana}
              />

              <SelectField
                label="Condición principal"
                value={formData.condicion_principal}
                onChange={(value) =>
                  actualizarCampo("condicion_principal", value)
                }
                options={condicionesActor}
              />

              <NumberField
                label="Número de actores"
                value={formData.num_actores}
                min={1}
                max={10}
                onChange={(value) => actualizarCampo("num_actores", value)}
              />

              <ReadOnlyField
                label="Edad promedio calculada"
                value={formData.edad_promedio_actor}
              />

              <NumberField
                label="Edad mínima de actores"
                value={formData.edad_min_actor}
                min={0}
                max={118}
                onChange={(value) => actualizarCampo("edad_min_actor", value)}
              />

              <NumberField
                label="Edad máxima de actores"
                value={formData.edad_max_actor}
                min={0}
                max={120}
                onChange={(value) => actualizarCampo("edad_max_actor", value)}
              />

              <NumberField
                label="Número de hombres"
                value={formData.num_hombres}
                min={0}
                max={10}
                onChange={(value) => actualizarCampo("num_hombres", value)}
              />

              <NumberField
                label="Número de mujeres"
                value={formData.num_mujeres}
                min={0}
                max={10}
                onChange={(value) => actualizarCampo("num_mujeres", value)}
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
                  actualizarCampo("CLASE_VEHICULO_PRINCIPAL", Number(value))
                }
                options={clasesVehiculo}
              />

              <SelectField
                label="Servicio del vehículo"
                value={formData.servicio_principal}
                onChange={(value) =>
                  actualizarCampo("servicio_principal", Number(value))
                }
                options={serviciosVehiculo}
              />

              <SelectField
                label="Modalidad"
                value={formData.modalidad_principal}
                onChange={(value) =>
                  actualizarCampo("modalidad_principal", Number(value))
                }
                options={modalidadesVehiculo}
              />

              <SelectField
                label="Causa principal"
                value={formData.codigo_causa_principal}
                onChange={(value) =>
                  actualizarCampo("codigo_causa_principal", Number(value))
                }
                options={causasPrincipales}
              />

              <NumberField
                label="Número de causas registradas"
                value={formData.num_causas_registradas}
                min={0}
                max={7}
                onChange={(value) =>
                  actualizarCampo("num_causas_registradas", value)
                }
              />

              <NumberField
                label="Precipitación promedio"
                value={formData.precip_promedio_bogota}
                min={0}
                max={26.9}
                step={0.1}
                helper="Milímetros diarios. Rango histórico observado: 0 a 26.9 mm."
                onChange={(value) =>
                  actualizarCampo("precip_promedio_bogota", value)
                }
              />

              <NumberField
                label="Precipitación máxima"
                value={formData.precip_max_bogota}
                min={0}
                max={79}
                step={0.1}
                helper="Milímetros diarios. Rango histórico observado: 0 a 79 mm."
                onChange={(value) =>
                  actualizarCampo("precip_max_bogota", value)
                }
              />

              <ToggleField
                label="¿Es festivo?"
                value={formData.Festivo}
                onChange={(value) => actualizarCampo("Festivo", value)}
              />

              <ToggleField
                label="¿Día sin carro?"
                value={formData.Dia_sin_carro}
                onChange={(value) => actualizarCampo("Dia_sin_carro", value)}
              />

              <ToggleField
                label="¿Hubo protesta?"
                value={formData.Hubo_Protesta}
                onChange={(value) => actualizarCampo("Hubo_Protesta", value)}
              />

              <ToggleField
                label="¿Hay evento?"
                value={formData.Hay_Evento}
                onChange={(value) => actualizarCampo("Hay_Evento", value)}
              />
            </div>

            <button
              onClick={predecir}
              disabled={cargando}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 px-5 py-3 font-bold text-zinc-950 shadow-lg shadow-red-950/40 transition hover:scale-[1.01] hover:from-yellow-200 hover:via-orange-300 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-70"
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
              <p className="mt-4 rounded-2xl border border-red-400/50 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-orange-500/20 bg-zinc-950/80 p-6 shadow-2xl shadow-red-950/40">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5 text-amber-300" />
                Zona seleccionada
              </h2>

              <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-zinc-950 to-red-950/40 p-5">
                <p className="text-sm text-orange-100/60">Localidad</p>
                <p className="mt-1 text-3xl font-bold">
                  {localidadSeleccionada?.label}
                </p>
                <p className="mt-2 text-sm text-orange-100/60">
                  Código enviado al modelo: {formData.CODIGO_LOCALIDAD}
                </p>
              </div>

              <div className="mt-5">
                <BogotaMap
                   selectedLocalidad={Number(formData.CODIGO_LOCALIDAD)}
                   probabilidadGrave={resultado?.probabilidad_grave ?? null}
                />
              </div>

            </div>

            <div className="rounded-3xl border border-orange-500/20 bg-zinc-950/80 p-6 shadow-2xl shadow-red-950/40">
              <h2 className="mb-4 text-xl font-semibold">
                Resultado del modelo
              </h2>

              {!resultado ? (
                <p className="text-orange-100/70">
                  Completa el escenario y ejecuta la predicción para visualizar
                  la probabilidad estimada.
                </p>
              ) : (
                <div>
                  <div
                    className={`mb-4 flex items-center gap-3 rounded-2xl p-4 ${
                      resultado.prediccion_texto === "Grave"
                        ? "border border-red-400/30 bg-red-500/15 text-red-100"
                        : "border border-yellow-400/30 bg-yellow-400/10 text-yellow-100"
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

                  <p className="text-sm text-orange-100/60">
                    Probabilidad estimada de gravedad
                  </p>
                  <p className="mt-1 bg-gradient-to-r from-yellow-200 via-orange-300 to-red-400 bg-clip-text text-5xl font-bold text-transparent">
                    {probabilidadPorcentaje}%
                  </p>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500"
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

            <div className="rounded-3xl border border-orange-500/20 bg-zinc-950/80 p-6 shadow-2xl shadow-red-950/40">
              <h2 className="mb-3 text-xl font-semibold">
                Causa seleccionada
              </h2>
              <p className="text-sm text-orange-100/70">
                {causaSeleccionada?.label}
              </p>
              <p className="mt-2 text-xs text-orange-100/50">
                Código enviado al modelo: {formData.codigo_causa_principal}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-4xl text-sm text-orange-100/60">
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
      <span className="mb-2 block text-sm font-medium text-orange-100/80">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-orange-500/20 bg-zinc-950 px-4 py-3 text-orange-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-orange-400/20"
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
  helper,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  helper?: string;
  onChange: (value: number) => void;
}) {
  const limitarValor = (valor: number) => {
    if (Number.isNaN(valor)) return min ?? 0;
    if (min !== undefined && valor < min) return min;
    if (max !== undefined && valor > max) return max;
    return valor;
  };

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-orange-100/80">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(limitarValor(Number(event.target.value)))
        }
        className="w-full rounded-2xl border border-orange-500/20 bg-zinc-950 px-4 py-3 text-orange-50 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-orange-400/20"
      />
      {helper && (
        <p className="mt-1 text-xs text-orange-100/50">{helper}</p>
      )}
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
    <label className="flex items-center justify-between rounded-2xl border border-orange-500/20 bg-zinc-950 px-4 py-3">
      <span className="text-sm font-medium text-orange-100/80">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-xl border border-orange-500/20 bg-zinc-900 px-3 py-2 text-orange-50 outline-none focus:border-amber-300"
      >
        <option value={0}>No</option>
        <option value={1}>Sí</option>
      </select>
    </label>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-orange-500/20 bg-zinc-950 p-4">
      <p className="text-xs text-orange-100/50">{label}</p>
      <p className="mt-1 font-semibold text-orange-50">{value}</p>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string | number }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-orange-100/80">
        {label}
      </span>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full cursor-not-allowed rounded-2xl border border-orange-500/20 bg-zinc-900/70 px-4 py-3 text-orange-100/70 outline-none"
      />
    </label>
  );
}