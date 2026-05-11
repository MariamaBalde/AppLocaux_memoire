import { Fragment } from 'react';
import { ChevronDown, ChevronUp, Download, Plus, Search, ShieldCheck, ShieldQuestion, ShieldX } from 'lucide-react';

const STATUS_STYLE = {
  Actif: 'text-[#2f7a3b]',
  Signale: 'text-[#b45c1c]',
  'En revision': 'text-[#2f5f9f]',
  Suspendu: 'text-[#8f2f46]',
  Banni: 'text-[#7d2537]',
};

export default function VendorsTable({
  vendorSummary,
  exportVendorCsv,
  navigate,
  searchVendor,
  setSearchVendor,
  vendorFilter,
  setVendorFilter,
  vendorSort,
  setVendorSort,
  pagedVendors,
  expandedVendorId,
  setExpandedVendorId,
  processingActionId,
  handleApproveVendor,
  handleToggleSuspend,
  handleBanVendor,
  currentVendorPage,
  perPage,
  totalVendorPages,
  setVendorPage,
  filteredVendorRows,
  formatCompact,
  formatNumber,
  formatDateShort,
  getInitials,
}) {
  return (
    <section className="mb-6 rounded-lg border border-[#e4d9d0] bg-white p-5">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#261911]">Gestion des vendeurs</h2>
          <p className="text-sm text-[#6d5b4d]">
            {formatNumber(vendorSummary.total)} vendeurs - {formatNumber(vendorSummary.pending)} en attente de validation
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportVendorCsv}
            className="inline-flex items-center gap-2 rounded-md border border-[#dfcfc2] px-3 py-2 text-sm text-[#4e382a] hover:bg-[#f7f0ea]"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products/create')}
            className="inline-flex items-center gap-2 rounded-md bg-[#c7632a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#af5523]"
          >
            <Plus className="h-4 w-4" />
            Ajouter vendeur
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-md border border-[#eee1d8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">Total vendeurs</p>
          <p className="mt-2 text-3xl font-semibold text-[#23170f]">{formatNumber(vendorSummary.total)}</p>
          <p className="mt-1 text-xs text-[#6f5d4e]">{formatNumber(vendorSummary.active)} actifs</p>
        </article>
        <article className="rounded-md border border-[#eee1d8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">En attente KYC</p>
          <p className="mt-2 text-3xl font-semibold text-[#bf5a21]">{formatNumber(vendorSummary.pending)}</p>
          <p className="mt-1 text-xs text-[#6f5d4e]">Action requise</p>
        </article>
        <article className="rounded-md border border-[#eee1d8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">Signales / litiges</p>
          <p className="mt-2 text-3xl font-semibold text-[#b56a22]">{formatNumber(vendorSummary.flagged)}</p>
          <p className="mt-1 text-xs text-[#6f5d4e]">Surveillance</p>
        </article>
        <article className="rounded-md border border-[#eee1d8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">GMV total vendeurs</p>
          <p className="mt-2 text-3xl font-semibold text-[#23170f]">{formatCompact(vendorSummary.totalGMV)}</p>
          <p className="mt-1 text-xs text-[#6f5d4e]">FCFA estime</p>
        </article>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#987f6c]" />
          <input
            type="search"
            value={searchVendor}
            onChange={(event) => setSearchVendor(event.target.value)}
            placeholder="Rechercher un vendeur..."
            className="w-full rounded-md border border-[#e5d7cb] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c7632a]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: `Tous (${vendorSummary.total})` },
            { key: 'active', label: `Actifs (${vendorSummary.active})` },
            { key: 'pending', label: `En attente (${vendorSummary.pending})` },
            { key: 'flagged', label: `Signales (${vendorSummary.flagged})` },
            { key: 'suspended', label: `Suspendus (${vendorSummary.suspended})` },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setVendorFilter(filter.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                vendorFilter === filter.key ? 'bg-[#c7632a] text-white' : 'bg-[#f4eee9] text-[#5f4636]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#624c3c]">Trier:</span>
          <select
            value={vendorSort}
            onChange={(event) => setVendorSort(event.target.value)}
            className="rounded-md border border-[#e5d7cb] px-2 py-1.5 text-sm outline-none focus:border-[#c7632a]"
          >
            <option value="gmv_desc">GMV desc</option>
            <option value="gmv_asc">GMV asc</option>
            <option value="name">Nom A-Z</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-[#ecdfd4] text-left text-xs uppercase tracking-[0.14em] text-[#6f5d4e]">
              <th className="px-2 py-3"></th>
              <th className="px-2 py-3">Vendeur</th>
              <th className="px-2 py-3">Ville</th>
              <th className="px-2 py-3">Produits</th>
              <th className="px-2 py-3">Commandes</th>
              <th className="px-2 py-3">GMV (FCFA)</th>
              <th className="px-2 py-3">Note</th>
              <th className="px-2 py-3">KYC</th>
              <th className="px-2 py-3">Statut</th>
              <th className="px-2 py-3">Inscrit le</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedVendors.map((row) => {
              const expanded = expandedVendorId === row.id;
              return (
                <Fragment key={row.id}>
                  <tr className="border-b border-[#f3e9e1] align-top">
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedVendorId(expanded ? null : row.id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d8c6b9] text-[#6b5342] hover:bg-[#f7f0ea]"
                        aria-label={expanded ? 'Fermer details vendeur' : 'Ouvrir details vendeur'}
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#c9723a] text-xs font-semibold text-white">
                          {getInitials(row.name)}
                        </span>
                        <div>
                          <p className="font-medium text-[#2b1c13]">{row.name}</p>
                          <p className="text-xs text-[#7c6a5c]">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{row.city}</td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.products)}</td>
                    <td className="px-2 py-3 text-[#3e2b1f]">
                      {formatNumber(row.orders)}
                      {row.ordersSource === 'recent' ? <span className="block text-[10px] text-[#8e7767]">recentes</span> : null}
                    </td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.gmv)}</td>
                    <td className="px-2 py-3 text-[#3e2b1f]">
                      {row.rating > 0 ? `★★★★★ ${row.rating.toFixed(1)}` : 'Non note'}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          row.kyc === 'Verifie'
                            ? 'bg-[#edf8ef] text-[#2f7a3b]'
                            : row.kyc === 'En cours'
                              ? 'bg-[#fff5e8] text-[#b7771e]'
                              : 'bg-[#fcecee] text-[#9d3349]'
                        }`}
                      >
                        {row.kyc === 'Verifie' ? <ShieldCheck className="h-3.5 w-3.5" /> : null}
                        {row.kyc === 'En cours' ? <ShieldQuestion className="h-3.5 w-3.5" /> : null}
                        {row.kyc === 'Manquant' ? <ShieldX className="h-3.5 w-3.5" /> : null}
                        {row.kyc}
                      </span>
                    </td>
                    <td className={`px-2 py-3 font-medium ${STATUS_STYLE[row.status] || 'text-[#3e2b1f]'}`}>
                      {row.status}
                    </td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{formatDateShort(row.joinedAt)}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={processingActionId === `approve-${row.id}` || row.kyc === 'Verifie' || row.status === 'Banni'}
                          onClick={() => handleApproveVendor(row)}
                          className="rounded-md border border-[#c8e4cf] bg-[#f2fbf5] px-2 py-1 text-xs font-semibold text-[#2f7a3b] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approuver
                        </button>
                        <button
                          type="button"
                          disabled={processingActionId === `suspend-${row.id}` || row.status === 'Banni'}
                          onClick={() => handleToggleSuspend(row)}
                          className="rounded-md border border-[#f0d7c2] bg-[#fff7ef] px-2 py-1 text-xs font-semibold text-[#8d4f22] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {row.status === 'Suspendu' ? 'Reactiver' : 'Suspendre'}
                        </button>
                        <button
                          type="button"
                          disabled={processingActionId === `ban-${row.id}` || row.status === 'Banni'}
                          onClick={() => handleBanVendor(row)}
                          className="rounded-md border border-[#f3ccd4] bg-[#fff1f4] px-2 py-1 text-xs font-semibold text-[#8f2f46] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Bannir
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="border-b border-[#f3e9e1] bg-[#fcf9f6]">
                      <td colSpan={11} className="px-4 py-4">
                        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                          <div>
                            <p className="text-sm font-semibold text-[#2a1a10]">Detail vendeur</p>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <p className="text-sm text-[#5f4a3b]">Boutique: <span className="font-medium text-[#2b1c13]">{row.shopName}</span></p>
                              <p className="text-sm text-[#5f4a3b]">Email: <span className="font-medium text-[#2b1c13]">{row.email}</span></p>
                              <p className="text-sm text-[#5f4a3b]">KYC: <span className="font-medium text-[#2b1c13]">{row.kyc}</span></p>
                              <p className="text-sm text-[#5f4a3b]">Signalements: <span className="font-medium text-[#2b1c13]">{row.flagged ? 'Oui' : 'Non'}</span></p>
                              <p className="text-sm text-[#5f4a3b]">Email verifie: <span className="font-medium text-[#2b1c13]">{row.verifiedEmail ? 'Oui' : 'Non'}</span></p>
                              <p className="text-sm text-[#5f4a3b]">Source commandes: <span className="font-medium text-[#2b1c13]">{row.ordersSource === 'global' ? 'Total consolide' : 'Echantillon recent'}</span></p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#2a1a10]">Indicateurs fiables</p>
                            <div className="mt-3 rounded-lg border border-[#eadfd5] bg-white p-3 text-sm text-[#5f4a3b]">
                              <p>Les valeurs affichees ici proviennent uniquement des donnees backend verifiees.</p>
                              <p className="mt-2">GMV: <span className="font-medium text-[#2b1c13]">{formatNumber(row.gmv)} FCFA</span></p>
                              <p>Produits: <span className="font-medium text-[#2b1c13]">{formatNumber(row.products)}</span></p>
                              <p>Commandes: <span className="font-medium text-[#2b1c13]">{formatNumber(row.orders)}</span></p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            {!pagedVendors.length ? (
              <tr>
                <td colSpan={11} className="px-2 py-10 text-center text-sm text-[#7a6556]">
                  Aucun vendeur trouve avec ces filtres.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6d5a4b]">
        <p>
          Affichage {pagedVendors.length ? `${(currentVendorPage - 1) * perPage + 1}-${(currentVendorPage - 1) * perPage + pagedVendors.length}` : '0'}
          {' '}sur {filteredVendorRows.length} vendeurs
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVendorPage((prev) => Math.max(1, prev - 1))}
            disabled={currentVendorPage <= 1}
            className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </button>
          <span className="rounded-md bg-[#c7632a] px-2.5 py-1 text-white">{currentVendorPage}</span>
          <span>/ {totalVendorPages}</span>
          <button
            type="button"
            onClick={() => setVendorPage((prev) => Math.min(totalVendorPages, prev + 1))}
            disabled={currentVendorPage >= totalVendorPages}
            className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </div>
      </div>
    </section>
  );
}
