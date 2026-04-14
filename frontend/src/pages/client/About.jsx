import { useEffect, useMemo, useState } from 'react';
import { Globe2, Handshake, Leaf, Lock, Quote, ShieldCheck, Sprout, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';

const HERO_STATS = [
  { key: 'countries', icon: '🌍', label: 'Pays atteints', value: 32, unit: '' },
  { key: 'vendors', icon: '🏬', label: 'Vendeurs partenaires', value: 85, unit: '' },
  { key: 'orders', icon: '📦', label: 'Commandes livrees', value: 4700, unit: '+' },
  { key: 'rating', icon: '⭐', label: 'Satisfaction client', value: 48, unit: '/10' },
];

const PILLARS = [
  {
    title: 'Connecter producteurs et diaspora',
    description:
      'Nous creons un canal direct entre producteurs locaux senegalais et diaspora africaine sans intermediaires inutiles.',
    icon: Handshake,
  },
  {
    title: 'Digitaliser le commerce local',
    description:
      'Nous donnons aux vendeurs des outils modernes: boutique en ligne, suivi des commandes et pilotage de leur activite.',
    icon: Users,
  },
  {
    title: 'Valoriser le patrimoine africain',
    description:
      'Chaque commande contribue a preserver des savoir-faire artisanaux et a valoriser les produits locaux africains.',
    icon: Leaf,
  },
];

const TIMELINE = [
  {
    year: '2024',
    month: 'Janvier',
    title: 'L idee nait a Dakar',
    description:
      "Mariama, de retour d'un sejour en France, constate la difficulte d'acces aux produits authentiques pour la diaspora.",
    color: 'bg-[#cb6b2f]',
  },
  {
    year: '2024',
    month: 'Juin',
    title: 'Premier prototype lance',
    description:
      '5 vendeurs pilotes a Dakar, premieres livraisons vers Paris, et validation du besoin terrain.',
    color: 'bg-[#d3a53f]',
  },
  {
    year: '2025',
    month: 'Mars',
    title: 'Lancement officiel',
    description:
      'La plateforme ouvre avec 30 vendeurs, 5 partenaires logistiques et une couverture de 15 pays.',
    color: 'bg-[#436c45]',
  },
  {
    year: '2026',
    month: "Aujourd'hui",
    title: 'Passage a l echelle',
    description:
      '85 vendeurs, 32 pays et 4700+ commandes. Extension active vers de nouveaux pays d Afrique de l Ouest.',
    color: 'bg-[#2267b1]',
  },
];

const TEAM = [
  { initials: 'MB', name: 'Mariama Balde', role: 'Co-fondatrice & CEO', city: 'Dakar, Senegal', color: 'bg-[#cb6b2f]' },
  { initials: 'KB', name: 'Khadidiatou Balde', role: 'Co-fondatrice & COO', city: 'Dakar, Senegal', color: 'bg-[#4f7848]' },
  { initials: 'FD', name: 'Fatoumata Diallo', role: 'Co-fondatrice & CTO', city: 'Dakar, Senegal', color: 'bg-[#1f67b7]' },
  { initials: 'AN', name: 'Awa Ndiaye', role: 'Head of Partnerships', city: 'Paris, France', color: 'bg-[#6f466e]' },
];

const VALUES = [
  {
    title: 'Confiance & transparence',
    description:
      'Chaque vendeur est verifie. Chaque transaction est securisee. Nous publions nos commissions et nos delais clairement.',
    icon: ShieldCheck,
  },
  {
    title: 'Impact local positif',
    description:
      'Chaque vente genere un revenu direct pour un producteur local. Nous reinvestissons dans la formation vendeurs.',
    icon: Sprout,
  },
  {
    title: 'Securite des paiements',
    description:
      'Les paiements sont chiffres et conserves en environnement securise jusqu a confirmation de livraison.',
    icon: Lock,
  },
  {
    title: 'Fierte africaine',
    description:
      'Nous croyons que les produits africains ont leur place sur les marches premium mondiaux, avec exigence et dignite.',
    icon: Globe2,
  },
];

const PAYMENT_METHODS = ['Wave', 'Orange Money', 'Visa', 'Mastercard', 'Mobile Money'];

function useAnimatedStats(items) {
  const [values, setValues] = useState(() => items.map(() => 0));

  useEffect(() => {
    const duration = 1300;
    const startedAt = performance.now();
    let frameId = null;

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValues(items.map((item) => Math.round(item.value * eased)));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [items]);

  return values;
}

export default function About() {
  const animatedValues = useAnimatedStats(HERO_STATS);

  const heroMetrics = useMemo(
    () =>
      HERO_STATS.map((item, index) => ({
        ...item,
        display: item.key === 'rating' ? (animatedValues[index] / 10).toFixed(1) : animatedValues[index].toLocaleString('fr-FR'),
      })),
    [animatedValues]
  );

  return (
    <>
      <Navbar variant="catalog" />

      <div className="min-h-screen bg-[#f4f3f1] text-[#1f1712]">
        <section className="relative overflow-hidden border-b border-[#3a1f11] bg-[#2a0b03] px-6 py-14 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1.1fr_1fr]">
            <div className="text-[#f2d8bf]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d48959]">Notre histoire</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#fff1dd] md:text-6xl">
                Nes a Dakar,
                <br />
                connectes au monde
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#d8b79a]">
                AfriMarket est ne d un constat simple: des millions de personnes de la diaspora cherchent a retrouver
                les saveurs authentiques de leur pays d origine, tandis que des producteurs locaux talentueux
                peinent a acceder aux marches mondiaux.
              </p>
              <p className="mt-4 text-[#d8b79a]">Notre mission: creer le pont digital entre ces deux mondes.</p>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#cb6b2f] text-sm font-semibold text-white">MB</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4f7848] text-sm font-semibold text-white">KB</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1f67b7] text-sm font-semibold text-white">FD</span>
                </div>
                <p className="text-sm text-[#f1d6b9]">Fonde par Mariama Balde, Khadidiatou Balde et Fatoumata Diallo - Dakar, Senegal - 2024</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#4f2d1d] bg-[#2e190f]/60 p-5 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
              <div className="space-y-3">
                {heroMetrics.map((metric) => (
                  <article key={metric.key} className="rounded-xl border border-[#5b3a27] bg-[#3a2316]/70 p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-xl">{metric.icon}</span>
                      <p className="text-2xl font-semibold text-[#f7cb6c]">
                        {metric.display}
                        {metric.unit}
                      </p>
                    </div>
                    <p className="mb-2 text-sm text-[#d0ac8d]">{metric.label}</p>
                    <div className="h-1 rounded-full bg-[#5e3d28]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#c46c2f] to-[#d9b14f]"
                        style={{ width: `${Math.min(100, (metric.value / HERO_STATS[2].value) * 100)}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">Ce qu on fait</p>
            <h2 className="mt-2 text-4xl font-semibold text-[#23170f]">Notre mission en 3 piliers</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.title} className="rounded-xl border border-[#e4d6ca] bg-white p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#f4ece4] text-[#bf6d36]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[#24180f]">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5d4d41]">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-8 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-[#e2d4c8] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">Chronologie</p>
            <h2 className="mt-2 text-3xl font-semibold">2024 → 2026</h2>
            <div className="mt-6 space-y-5">
              {TIMELINE.map((entry) => (
                <article key={`${entry.year}-${entry.title}`} className="flex gap-4">
                  <div className={`mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${entry.color}`}>
                    {entry.year.slice(2)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7362]">{entry.month} {entry.year}</p>
                    <h3 className="text-lg font-semibold text-[#24180f]">{entry.title}</h3>
                    <p className="text-sm leading-7 text-[#605044]">{entry.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#e2d4c8] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">Notre parcours</p>
            <h2 className="mt-2 text-4xl font-semibold text-[#24180f]">De Dakar au monde entier</h2>
            <p className="mt-5 text-sm leading-8 text-[#5f4f43]">
              AfriMarket n est pas qu une plateforme e-commerce. C est un projet humain ne de la frustration d une
              diaspora coupee de ses racines culinaires et de la conviction que les producteurs locaux meritent mieux.
            </p>
            <p className="mt-4 text-sm leading-8 text-[#5f4f43]">
              Nous croyons que la technologie peut etre un outil puissant de developpement local, a condition qu elle
              soit concue pour et par les communautes qu elle sert.
            </p>

            <blockquote className="mt-8 border-l-4 border-[#d7743a] pl-5 italic text-[#312116]">
              <Quote className="mb-2 h-5 w-5 text-[#d7743a]" />
              Chaque paquet qui arrive a Paris ou New York transporte un morceau du Senegal.
              <p className="mt-2 text-sm not-italic text-[#6a594d]">- Mariama Balde, co-fondatrice & CEO</p>
            </blockquote>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">L equipe</p>
            <h2 className="mt-2 text-4xl font-semibold text-[#24180f]">Les personnes derriere AfriMarket</h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {TEAM.map((member) => (
              <article key={member.name} className="text-center">
                <div className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white ${member.color}`}>
                  {member.initials}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-[#24180f]">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-[#3f2f24]">{member.role}</p>
                <p className="mt-1 text-sm text-[#766558]">📍 {member.city}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">Ce en quoi on croit</p>
            <h2 className="mt-2 text-4xl font-semibold text-[#24180f]">Nos valeurs</h2>
          </div>
          <div className="mt-9 grid gap-6 md:grid-cols-2">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <article key={value.title} className="rounded-xl border border-[#e3d5ca] bg-white p-5">
                  <div className="flex gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#f2ece4] text-[#bf6d36]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-[#24180f]">{value.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#615145]">{value.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-[#3a1809] bg-[#220b03] text-[#d9ad86]">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <Link to="/" className="text-3xl font-semibold text-[#f0b269]">AfriMarket</Link>
              <p className="mt-4 max-w-md text-sm leading-7 text-[#c19169]">
                La plateforme de reference pour commander et exporter les produits locaux africains, des producteurs
                locaux a la diaspora mondiale.
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a87b5a]">Moyens de paiement</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <span key={method} className="rounded-md border border-[#6a3d24] bg-[#2d1107] px-3 py-1 text-xs text-[#f0c59d]">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a87b5a]">Plateforme</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white">Catalogue</Link></li>
                <li><Link to="/products" className="hover:text-white">Vendeurs</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Expedition</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Suivi colis</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a87b5a]">Vendeurs</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white">Creer ma boutique</Link></li>
                <li><Link to="/vendeur/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Partenaires</Link></li>
                <li><Link to="/about" className="hover:text-white">Commissions</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a87b5a]">A propos</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">Notre histoire</Link></li>
                <li><Link to="/about" className="hover:text-white">L equipe</Link></li>
                <li><Link to="/about" className="hover:text-white">Contact</Link></li>
                <li><Link to="/about" className="hover:text-white">CGU - Confidentialite</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
