import { Fragment } from 'react';
import { ChevronDown, ChevronUp, Mail, Plus, Search } from 'lucide-react';

export default function ClientsTable({
  clientSummary,
  searchClient,
  setSearchClient,
  clientFilter,
  setClientFilter,
  clientSort,
  setClientSort,
  exportClientCsv,
  pagedClients,
  expandedClientId,
  setExpandedClientId,
  processingActionId,
  handleClientStatusToggle,
  currentClientPage,
  clientPerPage,
  totalClientPages,
  setClientPage,
  filteredClientRows,
  formatNumber,
  formatDateShort,
  getInitials,
}) {
  return (
    <section className="mb-6 rounded-lg border border-[#e4d9d0] bg-white p-5">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#261911]">Gestion des clients</h2>
          <p className="text-sm text-[#6d5b4d]">
            {formatNumber(clientSummary.total)} clients suivis
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={exportClientCsv} className="rounded-md border border-[#d2c3b7] px-4 py-2">Exporter CSV</button>
          <button
            type="button"
            onClick={() => window.location.assign(`mailto:?subject=Campagne clients&body=Segment: ${clientFilter}`)}
            className="inline-flex items-center gap-2 rounded-md border border-[#d2c3b7] px-4 py-2"
          >
            <Mail className="h-4 w-4" />
            Campagne email
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-md border border-[#eee1d8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">Base clients</p>
          <p className="mt-2 text-3xl font-semibold text-[#23170f]">{formatNumber(clientSummary.total)}</p>
          <p className="mt-1 text-xs text-[#6f5d4e]">{formatNumber(clientSummary.newThisMonth)} nouveaux ce mois</p>
        </article>
        <article className="rounded-md border border-[#eee1d8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">Panier moyen</p>
          <p className="mt-2 text-3xl font-semibold text-[#5a7fbe]">{formatNumber(Math.round(clientSummary.avgBasket))}</p>
          <p className="mt-1 text-xs text-[#6f5d4e]">FCFA</p>
        </article>
        <article className="rounded-md border border-[#eee1d8] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a4f3d]">Taux de retour</p>
          <p className="mt-2 text-3xl font-semibold text-[#c89a34]">{Math.round(clientSummary.returnRate)}%</p>
          <p className="mt-1 text-xs text-[#6f5d4e]">Clients avec 2 commandes+</p>
        </article>
        <article className="rounded-md border border-[#eee1d8] p-4">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#6a4f3d]">Segmentation clients</h3>
          <div className="space-y-3">
            {[
              { label: 'VIP', key: 'VIP', color: 'bg-[#c89a34]' },
              { label: 'Diaspora', key: 'Diaspora', color: 'bg-[#5a7fbe]' },
              { label: 'Local actif', key: 'Local actif', color: 'bg-[#68a057]' },
              { label: 'Nouveaux', key: 'Nouveau', color: 'bg-[#2e65a8]' },
              { label: 'Inactifs', key: 'Inactif', color: 'bg-[#8f7d6f]' },
            ].map((item) => {
              const value = clientSummary.segmentCount[item.key] || 0;
              const percent = clientSummary.total ? Math.round((value / clientSummary.total) * 100) : 0;
              return (
                <div key={item.key} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-sm">
                  <span>{item.label}</span>
                  <div className="h-2 rounded-full bg-[#efe7e0]">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-right text-[#5f4a3b]">{value} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#987f6c]" />
          <input
            type="search"
            value={searchClient}
            onChange={(event) => setSearchClient(event.target.value)}
            placeholder="Nom, email, pays..."
            className="w-full rounded-md border border-[#e5d7cb] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c7632a]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'vip', label: 'VIP' },
            { key: 'diaspora', label: 'Diaspora' },
            { key: 'local', label: 'Local' },
            { key: 'new', label: 'Nouveaux' },
            { key: 'inactive', label: 'Inactifs' },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setClientFilter(filter.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                clientFilter === filter.key ? 'bg-[#5a7fbe] text-white' : 'bg-[#f4eee9] text-[#5f4636]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#624c3c]">Trier:</span>
          <select
            value={clientSort}
            onChange={(event) => setClientSort(event.target.value)}
            className="rounded-md border border-[#e5d7cb] px-2 py-1.5 text-sm outline-none focus:border-[#5a7fbe]"
          >
            <option value="spent_desc">Depenses desc</option>
            <option value="spent_asc">Depenses asc</option>
            <option value="orders_desc">Commandes</option>
            <option value="name">Nom A-Z</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] text-sm">
          <thead>
            <tr className="border-b border-[#ecdfd4] text-left text-xs uppercase tracking-[0.14em] text-[#6f5d4e]">
              <th className="px-2 py-3"></th>
              <th className="px-2 py-3">Client</th>
              <th className="px-2 py-3">Pays</th>
              <th className="px-2 py-3">Segment</th>
              <th className="px-2 py-3">Commandes</th>
              <th className="px-2 py-3">Total depense</th>
              <th className="px-2 py-3">Dernier achat</th>
              <th className="px-2 py-3">Mode paiement</th>
              <th className="px-2 py-3">Fidelite</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedClients.map((row) => {
              const expanded = expandedClientId === row.id;
              return (
                <Fragment key={row.id}>
                  <tr className="border-b border-[#f3e9e1] align-top">
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedClientId(expanded ? null : row.id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d8c6b9] text-[#6b5342] hover:bg-[#f7f0ea]"
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5f7fb6] text-xs font-semibold text-white">
                          {getInitials(row.name)}
                        </span>
                        <div>
                          <p className="font-medium text-[#2b1c13]">{row.name}</p>
                          <p className="text-xs text-[#7c6a5c]">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{row.flag} {row.city}</td>
                    <td className="px-2 py-3">
                      <span className="rounded-full bg-[#eef3fc] px-2 py-1 text-xs font-semibold text-[#355c93]">{row.segment}</span>
                    </td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{row.ordersCount}</td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.totalSpent)}</td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{row.lastPurchaseLabel}</td>
                    <td className="px-2 py-3 text-[#3e2b1f]">{row.paymentMethod}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-[#efe7e0]">
                          <div className="h-full rounded-full bg-[#c89a34]" style={{ width: `${row.fidelityProgress}%` }} />
                        </div>
                        <span className="text-xs text-[#6f5d4e]">{'●'.repeat(row.fidelityPoints)}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        disabled={processingActionId === `client-${row.id}`}
                        onClick={() => handleClientStatusToggle(row)}
                        className="rounded-md border border-[#f0d7c2] bg-[#fff7ef] px-2 py-1 text-xs font-semibold text-[#8d4f22] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {row.status === 'suspendu' ? 'Reactiver' : 'Suspendre'}
                      </button>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="border-b border-[#f3e9e1] bg-[#fcf9f6]">
                      <td colSpan={10} className="px-4 py-4">
                        <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
                          <div>
                            <p className="text-sm font-semibold text-[#2a1a10]">Detail client</p>
                            <p className="mt-2 text-sm text-[#5f4a3b]">Segment: <span className="font-medium text-[#2b1c13]">{row.segment}</span></p>
                            <p className="text-sm text-[#5f4a3b]">Total depense: <span className="font-medium text-[#2b1c13]">{formatNumber(row.totalSpent)} FCFA</span></p>
                            <p className="text-sm text-[#5f4a3b]">Commandes: <span className="font-medium text-[#2b1c13]">{row.ordersCount}</span></p>
                            <p className="text-sm text-[#5f4a3b]">Panier moyen: <span className="font-medium text-[#2b1c13]">{formatNumber(Math.round(row.avgBasket))} FCFA</span></p>
                            <p className="text-sm text-[#5f4a3b]">Source metriques: <span className="font-medium text-[#2b1c13]">{row.metricsSource === 'full_history' ? 'Historique complet' : row.metricsSource}</span></p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#2a1a10]">Historique commandes recentes chargees</p>
                            <div className="mt-2 space-y-2">
                              {row.orderHistory.length ? row.orderHistory.map((order) => (
                                <div key={order.id} className="rounded-md border border-[#eadfd5] bg-white px-3 py-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <p className="font-medium text-[#2b1c13]">#{order.number}</p>
                                    <p className="text-[#2b1c13]">{formatNumber(order.total)} FCFA</p>
                                  </div>
                                  <p className="text-xs text-[#7a6758]">{formatDateShort(order.date)} - {order.payment} - {order.status}</p>
                                </div>
                              )) : (
                                <p className="text-sm text-[#7a6758]">Aucune commande recente chargee pour ce client.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            {!pagedClients.length ? (
              <tr>
                <td colSpan={10} className="px-2 py-10 text-center text-sm text-[#7a6556]">
                  Aucun client trouve avec ces filtres.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6d5a4b]">
        <p>
          Affichage {pagedClients.length ? `${(currentClientPage - 1) * clientPerPage + 1}-${(currentClientPage - 1) * clientPerPage + pagedClients.length}` : '0'}
          {' '}sur {filteredClientRows.length} clients
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setClientPage((prev) => Math.max(1, prev - 1))}
            disabled={currentClientPage <= 1}
            className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
          </button>
          <span className="rounded-md bg-[#5a7fbe] px-2.5 py-1 text-white">{currentClientPage}</span>
          <span>/ {totalClientPages}</span>
          <button
            type="button"
            onClick={() => setClientPage((prev) => Math.min(totalClientPages, prev + 1))}
            disabled={currentClientPage >= totalClientPages}
            className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </div>
      </div>
    </section>
  );
}
