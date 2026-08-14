"use client";

import { useMemo, useState } from "react";
import { City, cityLabel, searchCities } from "@/lib/onboarding/cities";
import { OnboardingData } from "@/lib/profile";

interface Props {
  onSubmit: (data: OnboardingData) => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 dark:border-neutral-700 dark:bg-neutral-900";

export default function Onboarding({ onSubmit }: Props) {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [city, setCity] = useState<City | null>(null);
  const [manual, setManual] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [manualTz, setManualTz] = useState("America/Sao_Paulo");
  const [touched, setTouched] = useState(false);

  const suggestions = useMemo(
    () => (city && cityQuery === cityLabel(city) ? [] : searchCities(cityQuery)),
    [cityQuery, city]
  );

  const nameWords = fullName.trim().split(/\s+/).filter(Boolean);
  const errors: Record<string, string> = {};
  if (nameWords.length < 2) {
    errors.fullName = "Informe o nome completo — a numerologia usa todos os nomes de registro.";
  }
  if (!birthDate) {
    errors.birthDate = "Informe a data de nascimento.";
  } else {
    const year = Number(birthDate.slice(0, 4));
    if (year < 1900 || year > new Date().getFullYear()) {
      errors.birthDate = "Data fora do intervalo suportado (1900 até hoje).";
    }
  }
  if (!timeUnknown && !birthTime) {
    errors.birthTime = "Informe o horário, ou marque que não sabe.";
  }
  if (manual) {
    const lat = Number(manualLat);
    const lon = Number(manualLon);
    if (!manualLat || Number.isNaN(lat) || lat < -90 || lat > 90) {
      errors.manualLat = "Latitude deve estar entre -90 e 90.";
    }
    if (!manualLon || Number.isNaN(lon) || lon < -180 || lon > 180) {
      errors.manualLon = "Longitude deve estar entre -180 e 180.";
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: manualTz });
    } catch {
      errors.manualTz = "Fuso horário IANA inválido (ex.: America/Sao_Paulo).";
    }
  } else if (!city) {
    errors.city = "Selecione a cidade de nascimento na lista.";
  }

  const valid = Object.keys(errors).length === 0;

  const handleSubmit = () => {
    setTouched(true);
    if (!valid) return;
    onSubmit({
      fullName: fullName.trim(),
      birthDate,
      birthTime: timeUnknown ? "" : birthTime,
      timeUnknown,
      placeLabel: manual ? `${manualLat}, ${manualLon}` : cityLabel(city!),
      latitude: manual ? Number(manualLat) : city!.latitude,
      longitude: manual ? Number(manualLon) : city!.longitude,
      timeZone: manual ? manualTz : city!.timeZone,
    });
  };

  const showError = (key: string) => touched && errors[key];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold">Antes de começar</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Esses dados geram o seu mapa astral e o seu mapa numerológico. Tudo é
          calculado no seu navegador — nada é enviado para nenhum servidor.
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nome completo</span>
        <input
          className={inputClass}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Como está na sua certidão de nascimento"
          autoComplete="name"
        />
        <span className="text-xs text-neutral-500">
          Use o nome de registro completo: a numerologia pitagórica soma cada letra.
        </span>
        {showError("fullName") && <span className="text-xs text-red-500">{errors.fullName}</span>}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Data de nascimento</span>
          <input
            type="date"
            className={inputClass}
            value={birthDate}
            max={new Date().toISOString().slice(0, 10)}
            min="1900-01-01"
            onChange={(e) => setBirthDate(e.target.value)}
          />
          {showError("birthDate") && <span className="text-xs text-red-500">{errors.birthDate}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Horário de nascimento</span>
          <input
            type="time"
            className={inputClass}
            value={birthTime}
            disabled={timeUnknown}
            onChange={(e) => setBirthTime(e.target.value)}
          />
          {showError("birthTime") && <span className="text-xs text-red-500">{errors.birthTime}</span>}
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={timeUnknown}
          onChange={(e) => setTimeUnknown(e.target.checked)}
        />
        <span>
          Não sei o horário
          <span className="block text-xs text-neutral-500">
            Usaremos meio-dia. O Ascendente, o Meio-do-Céu e as casas ficam
            indisponíveis, e a Lua pode variar alguns graus.
          </span>
        </span>
      </label>

      {!manual ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Cidade de nascimento</span>
          <input
            className={inputClass}
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              setCity(null);
            }}
            placeholder="Comece a digitar: São Paulo, Recife, Lisboa..."
          />
          {suggestions.length > 0 && (
            <ul className="max-h-48 overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              {suggestions.map((suggestion) => (
                <li key={`${suggestion.name}-${suggestion.region}-${suggestion.country}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setCity(suggestion);
                      setCityQuery(cityLabel(suggestion));
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  >
                    {cityLabel(suggestion)}
                    <span className="ml-2 text-xs text-neutral-400">{suggestion.timeZone}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {city && (
            <span className="text-xs text-neutral-500">
              {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)} · {city.timeZone}
            </span>
          )}
          {showError("city") && <span className="text-xs text-red-500">{errors.city}</span>}
          <button
            type="button"
            onClick={() => setManual(true)}
            className="self-start text-xs text-indigo-600 underline dark:text-indigo-400"
          >
            Minha cidade não está na lista
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <span className="text-sm font-medium">Coordenadas manuais</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Latitude (sul é negativo)</span>
              <input className={inputClass} value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="-23.5505" />
              {showError("manualLat") && <span className="text-xs text-red-500">{errors.manualLat}</span>}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Longitude (oeste é negativo)</span>
              <input className={inputClass} value={manualLon} onChange={(e) => setManualLon(e.target.value)} placeholder="-46.6333" />
              {showError("manualLon") && <span className="text-xs text-red-500">{errors.manualLon}</span>}
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">Fuso horário IANA</span>
            <input className={inputClass} value={manualTz} onChange={(e) => setManualTz(e.target.value)} />
            {showError("manualTz") && <span className="text-xs text-red-500">{errors.manualTz}</span>}
          </label>
          <button
            type="button"
            onClick={() => setManual(false)}
            className="self-start text-xs text-indigo-600 underline dark:text-indigo-400"
          >
            Voltar para a busca por cidade
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Começar o teste
      </button>
      {touched && !valid && (
        <p className="text-xs text-red-500">Revise os campos destacados acima.</p>
      )}
    </div>
  );
}
