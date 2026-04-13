import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  Globe,
  Landmark,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
  Truck,
  UserX,
  WandSparkles,
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition ${
        checked ? 'border-[#bf6129] bg-[#cb6b2f]' : 'border-[#d8cdc2] bg-[#f2ece7]'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

const INITIAL_SETTINGS = {
  general: {
    platform_name: 'AfriMarket',
    slogan: "L'Afrique dans votre assiette",
    contact_email: 'contact@afrimarket.sn',
    support_phone: '+221 77 404 76 68',
    country: 'Sénégal',
    currency: 'FCFA (XOF)',
    language: 'Français',
    timezone: 'Africa/Dakar (UTC+0)',
    platform_url: 'https://afrimarket.sn',
    options: {
      maintenance_mode: false,
      vendor_signup_open: true,
      manual_product_validation: true,
      international_orders: true,
      customer_reviews: true,
    },
  },
  commissions: {
    rows: [
      { category: 'Fruits & Légumes', percent: 10, minimum: 500 },
      { category: 'Produits transformés', percent: 12, minimum: 700 },
      { category: 'Épices & Condiments', percent: 9, minimum: 400 },
      { category: 'Boissons', percent: 11, minimum: 600 },
      { category: 'Artisanat', percent: 8, minimum: 800 },
    ],
    payout_frequency: 'Hebdomadaire',
    payout_threshold: 25000,
    payout_delay_days: 3,
    payout_method: 'Wave / Orange Money',
  },
  payments: {
    gateways: [
      { id: 'wave', label: 'Wave', enabled: true, account: '77 404 76 68' },
      { id: 'orange_money', label: 'Orange Money', enabled: true, account: '77 404 76 68' },
      { id: 'visa', label: 'Visa / Mastercard', enabled: true, account: 'Stripe Connect' },
      { id: 'paypal', label: 'PayPal', enabled: false, account: 'finance@afrimarket.sn' },
      { id: 'free_money', label: 'Free Money', enabled: true, account: '77 404 76 68' },
      { id: 'cashless_wallet', label: 'Wallet interne', enabled: false, account: 'AFM Wallet' },
    ],
    new_gateway_name: '',
  },
  shipping: {
    zones: [
      { destination: 'Dakar Express', carrier: 'Yobantel Express', delay: '24h', fee: 1500, enabled: true },
      { destination: 'Sénégal (national)', carrier: 'EMS Sénégal', delay: '2-4 jours', fee: 3500, enabled: true },
      { destination: 'France', carrier: 'DHL', delay: '4-6 jours', fee: 9000, enabled: true },
      { destination: 'USA', carrier: 'FedEx', delay: '5-8 jours', fee: 12000, enabled: true },
      { destination: 'Europe', carrier: 'Chronopost', delay: '4-7 jours', fee: 10000, enabled: true },
      { destination: "Côte d'Ivoire", carrier: 'UPS', delay: '3-5 jours', fee: 8000, enabled: true },
      { destination: 'Émirats', carrier: 'Aramex', delay: '5-7 jours', fee: 13000, enabled: false },
    ],
  },
  notifications: {
    channels: [
      { key: 'email', label: 'Email (SendGrid)', enabled: true, events: ['nouvelle commande', 'paiement validé', 'compte suspendu'] },
      { key: 'sms', label: 'WhatsApp / SMS (Twilio)', enabled: true, events: ['expédition', 'retard livraison', 'OTP'] },
      { key: 'push', label: 'Push mobile (Firebase)', enabled: true, events: ['promo', 'commande livrée', 'avis demandé'] },
      { key: 'webhook', label: 'Webhook API', enabled: false, events: ['order.created', 'payment.success'] },
    ],
  },
  security: {
    enforce_2fa_admin: true,
    require_email_verification: true,
    anti_fraud_scoring: true,
    keep_audit_logs: true,
    session_duration_minutes: 120,
    max_login_attempts: 5,
  },
};

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saveState, setSaveState] = useState('idle');

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(INITIAL_SETTINGS),
    [settings]
  );

  const sectionItems = [
    { id: 'general', title: 'Général', subtitle: 'Informations de base', icon: Settings, group: 'Configuration' },
    { id: 'commissions', title: 'Commissions', subtitle: 'Taux & versements', icon: Landmark, group: 'Configuration' },
    { id: 'payments', title: 'Paiements', subtitle: 'Passerelles', icon: CreditCard, group: 'Configuration' },
    { id: 'shipping', title: 'Livraison', subtitle: 'Zones & tarifs', icon: Truck, group: 'Configuration' },
    { id: 'notifications', title: 'Notifications', subtitle: 'Canaux & événements', icon: Bell, group: 'Système' },
    { id: 'security', title: 'Sécurité', subtitle: 'Accès & règles', icon: Shield, group: 'Système' },
    { id: 'critical', title: 'Zone critique', subtitle: 'Actions sensibles', icon: AlertTriangle, group: 'Système' },
  ];

  const handleReset = () => {
    setSettings(INITIAL_SETTINGS);
    setSaveState('idle');
  };

  const handleSave = () => {
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    }, 700);
  };

  const toggleGeneralOption = (key) => {
    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        options: {
          ...prev.general.options,
          [key]: !prev.general.options[key],
        },
      },
    }));
  };

  const updateCommission = (index, field, value) => {
    setSettings((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        rows: prev.commissions.rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      },
    }));
  };

  const toggleGateway = (gatewayId) => {
    setSettings((prev) => ({
      ...prev,
      payments: {
        ...prev.payments,
        gateways: prev.payments.gateways.map((gateway) =>
          gateway.id === gatewayId ? { ...gateway, enabled: !gateway.enabled } : gateway
        ),
      },
    }));
  };

  const addGateway = () => {
    const name = settings.payments.new_gateway_name.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setSettings((prev) => ({
      ...prev,
      payments: {
        gateways: [...prev.payments.gateways, { id, label: name, enabled: false, account: 'À configurer' }],
        new_gateway_name: '',
      },
    }));
  };

  const toggleShippingZone = (index) => {
    setSettings((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        zones: prev.shipping.zones.map((zone, i) => (i === index ? { ...zone, enabled: !zone.enabled } : zone)),
      },
    }));
  };

  const toggleChannel = (channelKey) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        channels: prev.notifications.channels.map((channel) =>
          channel.key === channelKey ? { ...channel, enabled: !channel.enabled } : channel
        ),
      },
    }));
  };

  const toggleSecurity = (key) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: !prev.security[key],
      },
    }));
  };

  const renderGeneral = () => (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
        <h2 className="text-xl font-semibold text-[#2b1308]">Informations de la plateforme</h2>
        <p className="mt-1 text-sm text-[#6f5d4e]">Identité publique et configuration de base</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Nom de la plateforme</span>
            <input
              value={settings.general.platform_name}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                general: { ...prev.general, platform_name: event.target.value },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Slogan</span>
            <input
              value={settings.general.slogan}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                general: { ...prev.general, slogan: event.target.value },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Email de contact</span>
            <input
              value={settings.general.contact_email}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                general: { ...prev.general, contact_email: event.target.value },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Téléphone support</span>
            <input
              value={settings.general.support_phone}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                general: { ...prev.general, support_phone: event.target.value },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Devise par défaut</span>
            <div className="relative">
              <select
                value={settings.general.currency}
                onChange={(event) => setSettings((prev) => ({
                  ...prev,
                  general: { ...prev.general, currency: event.target.value },
                }))}
                className="w-full appearance-none rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2 pr-9"
              >
                <option>FCFA (XOF)</option>
                <option>EUR</option>
                <option>USD</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f5d4e]" />
            </div>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Langue par défaut</span>
            <div className="relative">
              <select
                value={settings.general.language}
                onChange={(event) => setSettings((prev) => ({
                  ...prev,
                  general: { ...prev.general, language: event.target.value },
                }))}
                className="w-full appearance-none rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2 pr-9"
              >
                <option>Français</option>
                <option>English</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f5d4e]" />
            </div>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Fuseau horaire</span>
            <div className="relative">
              <select
                value={settings.general.timezone}
                onChange={(event) => setSettings((prev) => ({
                  ...prev,
                  general: { ...prev.general, timezone: event.target.value },
                }))}
                className="w-full appearance-none rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2 pr-9"
              >
                <option>Africa/Dakar (UTC+0)</option>
                <option>Europe/Paris (UTC+1)</option>
                <option>America/New_York (UTC-5)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f5d4e]" />
            </div>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">URL de la plateforme</span>
            <input
              value={settings.general.platform_url}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                general: { ...prev.general, platform_url: event.target.value },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
        <h2 className="text-xl font-semibold text-[#2b1308]">Options de la plateforme</h2>
        <p className="mt-1 text-sm text-[#6f5d4e]">Fonctionnalités globales activées / désactivées</p>
        <div className="mt-6 space-y-5">
          {[
            {
              key: 'maintenance_mode',
              title: 'Mode maintenance',
              description: 'Affiche une page de maintenance aux visiteurs. Les admins restent connectés.',
            },
            {
              key: 'vendor_signup_open',
              title: 'Inscription vendeurs ouverte',
              description: 'Permet aux nouveaux vendeurs de créer un compte et soumettre leur boutique.',
            },
            {
              key: 'manual_product_validation',
              title: 'Validation manuelle des produits',
              description: 'Chaque nouveau produit doit être approuvé par un admin avant publication.',
            },
            {
              key: 'international_orders',
              title: 'Commandes internationales',
              description: 'Activer les commandes avec expédition hors Sénégal (diaspora).',
            },
            {
              key: 'customer_reviews',
              title: 'Avis et notations clients',
              description: 'Les clients peuvent noter les produits et laisser des commentaires.',
            },
          ].map((option) => (
            <div key={option.key} className="flex items-start justify-between gap-4 border-b border-[#f1e9e2] pb-4 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-[#2b1308]">{option.title}</p>
                <p className="text-sm text-[#6f5d4e]">{option.description}</p>
              </div>
              <Toggle
                checked={settings.general.options[option.key]}
                onChange={() => toggleGeneralOption(option.key)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
        <h2 className="text-xl font-semibold text-[#2b1308]">Commissions par catégorie</h2>
        <p className="mt-1 text-sm text-[#6f5d4e]">Tableau éditable des taux appliqués</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#eadfd4] text-left text-[#6f5d4e]">
                <th className="pb-3 font-medium">Catégorie</th>
                <th className="pb-3 font-medium">Commission (%)</th>
                <th className="pb-3 font-medium">Minimum (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {settings.commissions.rows.map((row, index) => (
                <tr key={row.category} className="border-b border-[#f1e9e2] last:border-0">
                  <td className="py-3 font-medium text-[#2b1308]">{row.category}</td>
                  <td className="py-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.percent}
                      onChange={(event) => updateCommission(index, 'percent', Number(event.target.value))}
                      className="w-28 rounded-md border border-[#dfd3c7] bg-[#fcfaf8] px-2 py-1.5"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      type="number"
                      min="0"
                      value={row.minimum}
                      onChange={(event) => updateCommission(index, 'minimum', Number(event.target.value))}
                      className="w-36 rounded-md border border-[#dfd3c7] bg-[#fcfaf8] px-2 py-1.5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
        <h2 className="text-xl font-semibold text-[#2b1308]">Règles de versement vendeurs</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Fréquence</span>
            <input
              value={settings.commissions.payout_frequency}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                commissions: { ...prev.commissions, payout_frequency: event.target.value },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Seuil minimum (FCFA)</span>
            <input
              type="number"
              min="0"
              value={settings.commissions.payout_threshold}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                commissions: { ...prev.commissions, payout_threshold: Number(event.target.value) },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Délai (jours)</span>
            <input
              type="number"
              min="0"
              value={settings.commissions.payout_delay_days}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                commissions: { ...prev.commissions, payout_delay_days: Number(event.target.value) },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[#6f5d4e]">Mode de paiement</span>
            <input
              value={settings.commissions.payout_method}
              onChange={(event) => setSettings((prev) => ({
                ...prev,
                commissions: { ...prev.commissions, payout_method: event.target.value },
              }))}
              className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
            />
          </label>
        </div>
      </section>
    </div>
  );

  const renderPayments = () => (
    <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
      <h2 className="text-xl font-semibold text-[#2b1308]">Passerelles de paiement</h2>
      <p className="mt-1 text-sm text-[#6f5d4e]">6 méthodes configurables avec activation instantanée</p>
      <div className="mt-5 space-y-3">
        {settings.payments.gateways.map((gateway) => (
          <div key={gateway.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#efe5dc] bg-[#fcfaf8] p-4">
            <div>
              <p className="font-medium text-[#2b1308]">{gateway.label}</p>
              <p className="text-sm text-[#6f5d4e]">{gateway.account}</p>
            </div>
            <Toggle checked={gateway.enabled} onChange={() => toggleGateway(gateway.id)} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          placeholder="Ajouter une nouvelle passerelle"
          value={settings.payments.new_gateway_name}
          onChange={(event) => setSettings((prev) => ({
            ...prev,
            payments: { ...prev.payments, new_gateway_name: event.target.value },
          }))}
          className="min-w-[280px] flex-1 rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
        />
        <button
          type="button"
          onClick={addGateway}
          className="rounded-lg bg-[#cb6b2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b65e28]"
        >
          + Ajouter
        </button>
      </div>
    </section>
  );

  const renderShipping = () => (
    <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
      <h2 className="text-xl font-semibold text-[#2b1308]">Zones de livraison</h2>
      <p className="mt-1 text-sm text-[#6f5d4e]">Transporteur, délai, tarif et activation par destination</p>
      <div className="mt-5 space-y-3">
        {settings.shipping.zones.map((zone, index) => (
          <div key={zone.destination} className="grid gap-3 rounded-xl border border-[#efe5dc] bg-[#fcfaf8] p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center">
            <p className="font-medium text-[#2b1308]">{zone.destination}</p>
            <p className="text-sm text-[#6f5d4e]">{zone.carrier}</p>
            <p className="text-sm text-[#6f5d4e]">{zone.delay}</p>
            <p className="text-sm font-semibold text-[#2b1308]">{zone.fee.toLocaleString('fr-FR')} FCFA</p>
            <Toggle checked={zone.enabled} onChange={() => toggleShippingZone(index)} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
      <h2 className="text-xl font-semibold text-[#2b1308]">Canaux de notifications</h2>
      <div className="mt-5 space-y-3">
        {settings.notifications.channels.map((channel) => (
          <div key={channel.key} className="rounded-xl border border-[#efe5dc] bg-[#fcfaf8] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-[#2b1308]">{channel.label}</p>
              <Toggle checked={channel.enabled} onChange={() => toggleChannel(channel.key)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {channel.events.map((eventName) => (
                <span key={eventName} className="rounded-full bg-[#f0e4d8] px-3 py-1 text-xs text-[#6b4f3b]">
                  {eventName}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section className="rounded-2xl border border-[#e5ddd5] bg-white p-5">
      <h2 className="text-xl font-semibold text-[#2b1308]">Sécurité plateforme</h2>
      <div className="mt-5 space-y-4">
        {[
          { key: 'enforce_2fa_admin', title: '2FA administrateurs' },
          { key: 'require_email_verification', title: 'Vérification email obligatoire' },
          { key: 'anti_fraud_scoring', title: 'Moteur anti-fraude actif' },
          { key: 'keep_audit_logs', title: 'Conserver les logs d’audit' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-xl border border-[#efe5dc] bg-[#fcfaf8] p-4">
            <p className="font-medium text-[#2b1308]">{item.title}</p>
            <Toggle checked={settings.security[item.key]} onChange={() => toggleSecurity(item.key)} />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-[#6f5d4e]">Durée de session (minutes)</span>
          <input
            type="number"
            min="5"
            value={settings.security.session_duration_minutes}
            onChange={(event) => setSettings((prev) => ({
              ...prev,
              security: { ...prev.security, session_duration_minutes: Number(event.target.value) },
            }))}
            className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[#6f5d4e]">Tentatives max de connexion</span>
          <input
            type="number"
            min="1"
            value={settings.security.max_login_attempts}
            onChange={(event) => setSettings((prev) => ({
              ...prev,
              security: { ...prev.security, max_login_attempts: Number(event.target.value) },
            }))}
            className="w-full rounded-lg border border-[#dfd3c7] bg-[#fcfaf8] px-3 py-2"
          />
        </label>
      </div>
    </section>
  );

  const renderCritical = () => (
    <section className="rounded-2xl border border-[#f2cbc0] bg-[#fffaf8] p-5">
      <h2 className="text-xl font-semibold text-[#842b18]">Zone critique</h2>
      <p className="mt-1 text-sm text-[#9a4a38]">Actions sensibles et irréversibles</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => window.confirm('Vider le cache plateforme ?')}
          className="flex items-center gap-2 rounded-lg border border-[#f1c1b3] bg-white px-4 py-3 text-left text-sm font-medium text-[#7f3120]"
        >
          <WandSparkles className="h-4 w-4" />
          Vider le cache
        </button>
        <button
          type="button"
          onClick={() => window.confirm('Exporter toutes les données ?')}
          className="flex items-center gap-2 rounded-lg border border-[#f1c1b3] bg-white px-4 py-3 text-left text-sm font-medium text-[#7f3120]"
        >
          <Globe className="h-4 w-4" />
          Exporter les données
        </button>
        <button
          type="button"
          onClick={() => window.confirm('Suspendre temporairement la plateforme ?')}
          className="flex items-center gap-2 rounded-lg border border-[#f1c1b3] bg-white px-4 py-3 text-left text-sm font-medium text-[#7f3120]"
        >
          <UserX className="h-4 w-4" />
          Suspendre la plateforme
        </button>
        <button
          type="button"
          onClick={() => window.confirm('Supprimer définitivement la plateforme ?')}
          className="flex items-center gap-2 rounded-lg border border-[#ef9f8a] bg-[#fff1ed] px-4 py-3 text-left text-sm font-semibold text-[#932912]"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer définitivement
        </button>
      </div>
    </section>
  );

  const renderSection = () => {
    if (activeSection === 'general') return renderGeneral();
    if (activeSection === 'commissions') return renderCommissions();
    if (activeSection === 'payments') return renderPayments();
    if (activeSection === 'shipping') return renderShipping();
    if (activeSection === 'notifications') return renderNotifications();
    if (activeSection === 'security') return renderSecurity();
    return renderCritical();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f1ef]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-[1700px]">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-[#2b1308]">Paramètres de la plateforme</h1>
              <p className="text-sm text-[#6f5d4e]">Configuration globale - AfriMarket Admin</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-md border border-[#ddcec0] bg-white px-3 py-2 text-sm text-[#5f4a3d]"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-md bg-[#cb6b2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b55f2a]"
              >
                {saveState === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saveState === 'saving' ? 'Sauvegarde...' : saveState === 'saved' ? 'Sauvegardé' : 'Sauvegarder'}
              </button>
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-2xl border border-[#e1d7cc] bg-white p-4">
              <div className="space-y-4">
                {['Configuration', 'Système'].map((group) => (
                  <div key={group}>
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8c7463]">{group}</p>
                    <div className="space-y-1">
                      {sectionItems
                        .filter((item) => item.group === group)
                        .map((item) => {
                          const Icon = item.icon;
                          const active = activeSection === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setActiveSection(item.id)}
                              className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition ${
                                active ? 'border border-[#efc8b1] bg-[#fff2e8]' : 'border border-transparent hover:bg-[#f6f1ec]'
                              }`}
                            >
                              <Icon className={`mt-0.5 h-4 w-4 ${active ? 'text-[#cb6b2f]' : 'text-[#917865]'}`} />
                              <span>
                                <span className={`block text-sm font-medium ${active ? 'text-[#2b1308]' : 'text-[#3e2b1f]'}`}>{item.title}</span>
                                <span className="block text-xs text-[#8b7361]">{item.subtitle}</span>
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section>{renderSection()}</section>
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3d8cc] bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-[#6f5d4e]">
              <span className={`h-2 w-2 rounded-full ${hasUnsavedChanges ? 'bg-[#cb6b2f]' : 'bg-[#7aaa5d]'}`} />
              {hasUnsavedChanges ? 'Modifications non sauvegardées' : 'Toutes les modifications sont sauvegardées'}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md border border-[#ddcec0] bg-white px-3 py-2 text-sm text-[#5f4a3d]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-[#cb6b2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b55f2a]"
              >
                <span className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder les paramètres
                </span>
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
