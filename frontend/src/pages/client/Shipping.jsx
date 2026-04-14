import { useMemo, useState } from 'react';
import { CheckCircle2, Package, Plane, Search, Truck } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { formatPrice } from '../../utils/formatPrice';

const COUNTRIES = ['Senegal', 'France', 'Etats-Unis', 'Canada', 'Allemagne', 'Italie', 'Emirats', '+25 pays'];

const PROCESS_STEPS = [
  {
    id: 1,
    title: 'Commande passee',
    description: 'Le vendeur recoit votre commande, prepare le colis et confirme la disponibilite.',
    icon: Package,
  },
  {
    id: 2,
    title: 'Etiquette generee',
    description: 'AfriMarket genere les documents d expedition et attribue un numero de suivi.',
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: 'Collecte et transit',
    description: 'Le transporteur collecte le colis et vous recevez les notifications en temps reel.',
    icon: Plane,
  },
  {
    id: 4,
    title: 'Livraison a domicile',
    description: 'Le colis est remis a l adresse indiquee avec confirmation finale.',
    icon: Truck,
  },
];

const CARRIERS = [
  {
    id: 'dhl',
    name: 'DHL Express',
    regions: 'Europe • USA • Canada • Afrique',
    price: 7000,
    eta: '3-7 jours ouvres',
    maxWeight: 30,
    perks: ['Suivi GPS en direct', 'Notifications SMS', 'Documents douaniers inclus'],
  },
  {
    id: 'chrono',
    name: 'Chronopost Senegal',
    regions: 'Afrique de l Ouest • Europe',
    price: 4200,
    eta: '7-14 jours ouvres',
    maxWeight: 20,
    perks: ['Option groupage inter-vendeurs', 'Economies jusqu a 40%', 'Support client local'],
  },
  {
    id: 'eco',
    name: 'Eco Afrique',
    regions: 'Afrique de l Ouest',
    price: 2000,
    eta: '4-9 jours ouvres',
    maxWeight: 15,
    perks: ['Tarif mini', 'Depots locaux', 'Suivi par etapes'],
  },
];

const TRACKING_FIXTURES = {
  DHL: { status: 'En transit international', location: 'Plateforme de Paris CDG', progress: 68 },
  CHR: { status: 'Collecte confirmee', location: 'Hub Dakar', progress: 35 },
  ECO: { status: 'En cours de livraison', location: 'Dakar centre', progress: 84 },
};

export default function Shipping() {
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [selectedCarrierId, setSelectedCarrierId] = useState('chrono');
  const [weightKg, setWeightKg] = useState(2);

  const selectedCarrier = useMemo(
    () => CARRIERS.find((carrier) => carrier.id === selectedCarrierId) || CARRIERS[0],
    [selectedCarrierId]
  );

  const estimatedCost = useMemo(() => {
    const base = selectedCarrier.price;
    const surcharge = Math.max(0, Math.ceil(weightKg) - 1) * 350;
    return Math.min(7000, Math.max(2000, base + surcharge));
  }, [selectedCarrier, weightKg]);

  const handleTrack = (e) => {
    e.preventDefault();
    const normalized = trackingInput.trim().toUpperCase();

    if (!normalized || normalized.length < 6) {
      setTrackingResult({ error: 'Entrez un numero valide (ex: DHL-8821-FR).' });
      return;
    }

    const code = normalized.slice(0, 3);
    const found = TRACKING_FIXTURES[code] || {
      status: 'Etiquette creee',
      location: 'Centre logistique Dakar',
      progress: 20,
    };

    setTrackingResult({ error: null, code: normalized, ...found });
  };

  return (
    <>
      <Navbar variant="catalog" />

      <div className="min-h-screen bg-[#f2f1ef] text-[#1f1712]">
        <section className="bg-[#2a0b03] px-6 py-16 text-[#f9f0df]">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#ca7440]">Livraison mondiale</p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              Votre colis au bon endroit, <span className="text-[#e2b555]">au bon moment</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm text-[#dcc3ad] md:text-base">
              Livraison locale au Senegal et expedition internationale vers la diaspora. Suivez votre colis en temps reel.
            </p>

            <form
              onSubmit={handleTrack}
              className="mx-auto mt-8 flex max-w-2xl flex-col overflow-hidden rounded-md border border-[#4a2213] bg-[#1a0705] md:flex-row"
            >
              <label htmlFor="tracking-input" className="sr-only">Numero de suivi</label>
              <input
                id="tracking-input"
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Entrez votre numero de suivi (ex: DHL-8821-FR)"
                className="w-full bg-transparent px-4 py-3 text-sm text-[#f6ead8] placeholder:text-[#a88467] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#cb6b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b85e29]"
              >
                <Search className="h-4 w-4" />
                Suivre mon colis
              </button>
            </form>

            {trackingResult && (
              <div className="mx-auto mt-4 max-w-2xl rounded-md border border-[#355374] bg-[#0f2238] px-4 py-3 text-left text-sm">
                {trackingResult.error ? (
                  <p className="text-[#ffb2a9]">{trackingResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[#d7e6ff]">
                      <span className="font-semibold text-white">Suivi {trackingResult.code}</span> - {trackingResult.status}
                    </p>
                    <p className="text-[#9bb6d8]">Position actuelle: {trackingResult.location}</p>
                    <div className="h-2 w-full rounded-full bg-[#1f3856]">
                      <div className="h-full rounded-full bg-[#7cb3ff]" style={{ width: `${trackingResult.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-sm text-[#9fb7d4]">
              {COUNTRIES.map((country) => (
                <span key={country}>{country}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c6723b]">Processus</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#2a1c16]">Comment fonctionne l expedition ?</h2>
            <p className="mt-2 text-[#665548]">De votre commande a votre porte, en 4 etapes simples.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PROCESS_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.id} className="rounded-xl border border-[#e2d3c6] bg-white p-5 shadow-sm">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#f5ece3] text-[#8c5a33]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#2a1c16]">{step.id}. {step.title}</h3>
                  <p className="mt-2 text-sm text-[#645447]">{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c6723b]">Partenaires logistiques</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#2a1c16]">Transporteurs disponibles</h2>
            <p className="mt-2 text-[#665548]">Choisissez le mode d expedition adapte a votre destination et votre budget.</p>
          </div>

          <div className="mt-8 rounded-xl border border-[#dfcfc1] bg-white p-5">
            <p className="text-sm font-medium text-[#5d4e43]">Simulation rapide des frais</p>
            <div className="mt-3 grid gap-4 md:grid-cols-[1fr_130px] md:items-end">
              <div>
                <label htmlFor="weight-range" className="text-sm font-semibold text-[#2a1c16]">
                  Poids estime: {weightKg} kg
                </label>
                <input
                  id="weight-range"
                  type="range"
                  min="1"
                  max="15"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
              <div className="rounded-lg bg-[#f2e9de] p-3 text-center">
                <p className="text-xs uppercase text-[#7d695a]">Estimation</p>
                <p className="text-xl font-bold text-[#2a1c16]">{formatPrice(estimatedCost)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {CARRIERS.map((carrier) => {
              const active = carrier.id === selectedCarrierId;
              return (
                <article
                  key={carrier.id}
                  className={`rounded-xl border p-5 transition ${
                    active ? 'border-[#c6723b] bg-[#fff9f3] shadow-md' : 'border-[#dfcfc1] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2a1c16]">{carrier.name}</h3>
                      <p className="text-sm text-[#6f6053]">{carrier.regions}</p>
                    </div>
                    <p className="text-right text-sm font-semibold text-[#2a1c16]">A partir de {formatPrice(carrier.price)}</p>
                  </div>

                  <ul className="mt-4 space-y-1 text-sm text-[#5d4f43]">
                    <li>Delai: {carrier.eta}</li>
                    <li>Poids max: {carrier.maxWeight} kg</li>
                    {carrier.perks.map((perk) => (
                      <li key={perk}>• {perk}</li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => setSelectedCarrierId(carrier.id)}
                    className={`mt-5 w-full rounded-md px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-[#cb6b2f] text-white hover:bg-[#b85e29]'
                        : 'border border-[#d4b39b] text-[#8b5f3d] hover:bg-[#f7ede4]'
                    }`}
                  >
                    {active ? 'Selectionne' : 'Choisir'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
