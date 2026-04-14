import { Plus, Store, Package, TrendingUp, Globe, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';

const PLATFORM_STATS = [
  { value: '85', label: 'Vendeurs vérifiés' },
  { value: '240+', label: 'Produits' },
  { value: '4.8', label: 'Note moyenne' },
  { value: '32', label: 'Pays expédiés' },
];

const WHY_SELL = [
  {
    icon: Store,
    title: 'Boutique Gratuite',
    description: 'Pas d\'abonnement mensuel. Payez uniquement une commission de 5% sur les ventes réalisées.',
  },
  {
    icon: Globe,
    title: 'Touchez le Monde',
    description: 'Accédez à des clients au Sénégal et dans toute la diaspora africaine (Europe, USA, etc.).',
  },
  {
    icon: Package,
    title: 'Livraison Intégrée',
    description: 'Partenaires logistiques incluent DHL, Chronopost et réseaux locaux. Expédition simplifiée.',
  },
  {
    icon: TrendingUp,
    title: 'Tableau de Bord Complet',
    description: 'Suivez vos ventes, revenus, commandes et analysez votre performance en temps réel.',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Créez Votre Compte',
    description: 'Inscrivez-vous en quelques minutes avec vos informations de base.',
  },
  {
    step: 2,
    title: 'Publiez Vos Produits',
    description: 'Ajoutez vos produits avec photos, descriptions, prix et options de livraison.',
  },
  {
    step: 3,
    title: 'Recevez les Commandes',
    description: 'Les clients découvrent et achètent vos produits. Vous êtes notifié en temps réel.',
  },
  {
    step: 4,
    title: 'Expédiez & Gagnez',
    description: 'Préparez les colis et choisissez le mode de livraison. Gagnez vos revenus directement.',
  },
];

export default function Vendors() {
  return (
    <>
      <Navbar variant="catalog" />

      <div className="min-h-screen bg-[#f4f3f1] text-[#1f1712]">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#4a2213] bg-[#2a0b03] px-6 py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">Nos producteurs locaux</p>
              <h1 className="mt-3 text-5xl font-semibold leading-[1.05] text-[#f6ead8] md:text-7xl">
                Des vendeurs <span className="text-[#e2b555]">vérifiés</span> et passionnés
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base text-[#dcc3ad]">
                Découvrez les artisans et producteurs sénégalais qui fabriquent à la main les produits que vous aimez.
                Chaque boutique est vérifiée par AfriMarket.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#cb6b2f] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#b85e29]"
              >
                <Plus className="h-4 w-4" />
                Devenir vendeur
              </Link>
            </div>

            <div className="mt-12 border-t border-[#5d3522] pt-8">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {PLATFORM_STATS.map((stat) => (
                  <article key={stat.label} className="text-center">
                    <p className="text-4xl font-semibold text-[#f0be63]">{stat.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#a88467]">{stat.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi Vendre Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">Avantages</p>
              <h2 className="mt-3 text-4xl font-semibold text-[#1f1712] md:text-5xl">
                Pourquoi vendre sur <span className="text-[#cb6b2f]">AfriMarket</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[#6f6156]">
                Une plateforme conçue pour les producteurs locaux. Facile, gratuit et rentable.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {WHY_SELL.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-[#e8d5c4] bg-white p-6 transition hover:shadow-lg hover:border-[#cb6b2f]"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#fff1dd] text-[#cb6b2f]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1f1712]">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-[#6f6156]">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comment Ça Marche Section */}
        <section className="bg-[#f1f1ef] px-6 py-16 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ca7440]">Processus simple</p>
              <h2 className="mt-3 text-4xl font-semibold text-[#1f1712] md:text-5xl">
                Comment ça <span className="text-[#cb6b2f]">marche</span>
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {HOW_IT_WORKS.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#cb6b2f] text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1f1712]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#6f6156]">{item.description}</p>

                  {/* Connector line */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="absolute -right-4 top-7 hidden h-1 w-8 bg-[#e8d5c4] md:block lg:w-12" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border-2 border-[#cb6b2f] bg-gradient-to-br from-[#fff1dd] to-[#fde8d0] p-8 text-center md:p-12">
              <Zap className="mx-auto h-12 w-12 text-[#cb6b2f]" />
              <h2 className="mt-4 text-3xl font-bold text-[#1f1712] md:text-4xl">
                Prêt à démarrer?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[#6f6156]">
                Rejoignez 85+ vendeurs vérifiés qui gagnent des revenus en partageant leurs produits locaux avec le monde.
                L'inscription prend moins de 5 minutes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#cb6b2f] px-8 py-4 font-semibold text-white transition hover:bg-[#b85e29] hover:shadow-lg"
                >
                  Commencer à vendre
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#cb6b2f] px-8 py-4 font-semibold text-[#cb6b2f] transition hover:bg-[#fff1dd]"
                >
                  <CheckCircle className="h-4 w-4" />
                  Voir les vendeurs
                </Link>
              </div>

              <p className="mt-6 text-xs text-[#a88467]">
                ✓ Aucune carte de crédit requise • ✓ Gratuit pour 30 jours • ✓ Support client 24/7
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
