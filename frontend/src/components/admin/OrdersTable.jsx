import { AlertTriangle, ChevronDown, ChevronRight, House, Search, Truck, X } from 'lucide-react';

export default function OrdersTable({
  orderPipeline,
  setOrderFilter,
  filteredOrders,
  orderRows,
  setSelectedOrderId,
  urgentOrders,
  orderSearch,
  setOrderSearch,
  orderTypeFilter,
  setOrderTypeFilter,
  orderFilter,
  orderSort,
  setOrderSort,
  pagedOrders,
  selectedOrder,
  currentOrderPage,
  orderPerPage,
  totalOrderPages,
  setOrderPage,
  formatNumber,
  formatDateShort,
}) {
  return (
    <>
      <section className="mb-6 rounded-lg border border-[#e4d9d0] bg-white p-5">
        <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {orderPipeline.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => {
                setOrderFilter(step.key);
                const first = filteredOrders.find((row) => row.stage === step.key) || orderRows.find((row) => row.stage === step.key);
                if (first) setSelectedOrderId(first.id);
              }}
              className="rounded-md border border-[#eee1d8] p-3 text-left hover:bg-[#f8f3ee]"
            >
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f4738]">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${step.dot}`} />
                {step.label}
              </p>
              <p className="text-3xl font-semibold text-[#23170f]">{formatNumber(step.count)}</p>
              <p className="text-sm text-[#5f4a3b]">{formatNumber(step.amount)} FCFA</p>
              <div className="mt-2 h-1.5 rounded-full bg-[#efe7e0]">
                <div
                  className={`h-full rounded-full ${step.color}`}
                  style={{ width: `${orderRows.length ? (step.count / orderRows.length) * 100 : 0}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {urgentOrders.length ? (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-[#f4d7ca] bg-[#fff4ef] px-3 py-2 text-sm text-[#8c3f1d]">
            <AlertTriangle className="h-4 w-4" />
            {urgentOrders.length} commande(s) bloquee(s) +48h
          </div>
        ) : null}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <label className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#987f6c]" />
            <input
              type="search"
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
              placeholder="N° commande, client, produit..."
              className="w-full rounded-md border border-[#e5d7cb] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c7632a]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'local', label: 'Locales' },
              { key: 'international', label: 'Internationales' },
              { key: 'urgent', label: 'Urgentes' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  if (filter.key === 'local' || filter.key === 'international') {
                    setOrderTypeFilter(filter.key);
                    setOrderFilter('all');
                    return;
                  }
                  setOrderTypeFilter('all');
                  setOrderFilter(filter.key);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  (filter.key === orderFilter || filter.key === orderTypeFilter) ? 'bg-[#c7632a] text-white' : 'bg-[#f4eee9] text-[#5f4636]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#624c3c]">Trier:</span>
            <select
              value={orderSort}
              onChange={(event) => setOrderSort(event.target.value)}
              className="rounded-md border border-[#e5d7cb] px-2 py-1.5 text-sm outline-none focus:border-[#c7632a]"
            >
              <option value="date_desc">Date desc</option>
              <option value="amount_desc">Montant desc</option>
              <option value="amount_asc">Montant asc</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b border-[#ecdfd4] text-left text-xs uppercase tracking-[0.14em] text-[#6f5d4e]">
                <th className="px-2 py-3">N° commande</th>
                <th className="px-2 py-3">Client</th>
                <th className="px-2 py-3">Produits</th>
                <th className="px-2 py-3">Montant</th>
                <th className="px-2 py-3">Type</th>
                <th className="px-2 py-3">Statut</th>
                <th className="px-2 py-3">Progression</th>
                <th className="px-2 py-3">Vendeur</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedOrderId(row.id)}
                  className="cursor-pointer border-b border-[#f3e9e1] hover:bg-[#fbf7f3]"
                >
                  <td className="px-2 py-3 font-medium text-[#2b1c13]">
                    {row.orderNumber} {row.isUrgent ? <span className="text-xs text-[#a54a23]">Alerte 48h+</span> : null}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8c4c82] text-xs font-semibold text-white">
                        {row.clientInitials}
                      </span>
                      <div>
                        <p className="text-[#2b1c13]">{row.clientName}</p>
                        <p className="text-xs text-[#7c6a5c]">{row.clientCountry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-[#3e2b1f]">{row.productsLabel}</td>
                  <td className="px-2 py-3 text-[#3e2b1f]">{formatNumber(row.amount)}</td>
                  <td className="px-2 py-3 text-[#3e2b1f]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eef3fc] px-2 py-1 text-xs font-semibold text-[#355c93]">
                      {row.orderType === 'international' ? <Truck className="h-3.5 w-3.5" /> : <House className="h-3.5 w-3.5" />}
                      {row.orderType === 'international' ? 'Intl' : 'Local'}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[#3e2b1f]">{row.stageLabel}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span
                          key={`${row.id}-${idx}`}
                          className={`inline-flex h-1.5 w-4 rounded-full ${
                            idx < row.progressCount ? (row.stage === 'annulees' ? 'bg-[#a64c26]' : 'bg-[#4b8f30]') : 'bg-[#e4d9d0]'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-[#3e2b1f]">{row.vendorName}</td>
                  <td className="px-2 py-3 text-[#3e2b1f]">{row.dateLabel}</td>
                  <td className="px-2 py-3 text-[#3e2b1f]">
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))}
              {!pagedOrders.length ? (
                <tr>
                  <td colSpan={10} className="px-2 py-10 text-center text-sm text-[#7a6556]">
                    Aucune commande trouvee avec ces filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6d5a4b]">
          <p>
            Affichage {pagedOrders.length ? `${(currentOrderPage - 1) * orderPerPage + 1}-${(currentOrderPage - 1) * orderPerPage + pagedOrders.length}` : '0'}
            {' '}sur {filteredOrders.length} commandes
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
              disabled={currentOrderPage <= 1}
              className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
            <span className="rounded-md bg-[#c7632a] px-2.5 py-1 text-white">{currentOrderPage}</span>
            <span>/ {totalOrderPages}</span>
            <button
              type="button"
              onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
              disabled={currentOrderPage >= totalOrderPages}
              className="rounded-md border border-[#dfcfc2] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </div>
      </section>

      {selectedOrder ? (
        <>
          <button
            type="button"
            aria-label="Fermer detail commande"
            onClick={() => setSelectedOrderId(null)}
            className="fixed inset-0 z-30 bg-black/30"
          />
          <aside className="fixed right-0 top-0 z-40 h-full w-full max-w-md overflow-y-auto border-l border-[#e4d9d0] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#7c6a5c]">Detail commande</p>
                <h3 className="text-xl font-semibold text-[#24170f]">{selectedOrder.orderNumber}</h3>
                <p className="text-sm text-[#6d5a4b]">{selectedOrder.clientName} - {selectedOrder.clientEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-md border border-[#e1d2c5] p-1.5 text-[#6b5342] hover:bg-[#f7f0ea]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 rounded-md border border-[#eee1d8] bg-[#fcf9f6] p-3 text-sm">
              <p className="text-[#5f4a3b]">Montant: <span className="font-semibold text-[#2b1c13]">{formatNumber(selectedOrder.amount)} FCFA</span></p>
              <p className="text-[#5f4a3b]">Statut: <span className="font-semibold text-[#2b1c13]">{selectedOrder.stageLabel}</span></p>
              <p className="text-[#5f4a3b]">Vendeur: <span className="font-semibold text-[#2b1c13]">{selectedOrder.vendorName}</span></p>
            </div>

            <div className="mb-4 rounded-md border border-[#eee1d8] p-3">
              <p className="mb-2 text-sm font-semibold text-[#2a1a10]">Suivi logistique</p>
              <p className="text-sm text-[#5f4a3b]">Transporteur: <span className="font-medium text-[#2b1c13]">{selectedOrder.transporter}</span></p>
              <p className="text-sm text-[#5f4a3b]">Numero colis: <span className="font-medium text-[#2b1c13]">{selectedOrder.trackingNumber}</span></p>
              <p className="text-sm text-[#5f4a3b]">Livraison estimee: <span className="font-medium text-[#2b1c13]">{selectedOrder.estimatedDate}</span></p>
            </div>

            <div className="rounded-md border border-[#eee1d8] p-3">
              <p className="mb-3 text-sm font-semibold text-[#2a1a10]">Timeline de suivi</p>
              <div className="space-y-3">
                {[
                  { key: 'nouvelles', label: 'Nouvelle commande enregistree' },
                  { key: 'confirmees', label: 'Commande confirmee' },
                  { key: 'preparation', label: 'Preparation en cours' },
                  { key: 'expediees', label: 'Commande expediee' },
                  { key: 'livrees', label: 'Commande livree' },
                ].map((step, index) => {
                  const stageOrder = ['nouvelles', 'confirmees', 'preparation', 'expediees', 'livrees'];
                  const currentIndex = stageOrder.indexOf(selectedOrder.stage);
                  const active = selectedOrder.stage === 'annulees' ? index === 0 : index <= Math.max(0, currentIndex);
                  return (
                    <div key={step.key} className="flex items-start gap-2">
                      <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-[#4b8f30]' : 'bg-[#d7c9bd]'}`} />
                      <div>
                        <p className={`text-sm ${active ? 'text-[#2b1c13]' : 'text-[#8b7565]'}`}>{step.label}</p>
                        <p className="text-xs text-[#8b7565]">{formatDateShort(selectedOrder.rawDate)}</p>
                      </div>
                    </div>
                  );
                })}
                {selectedOrder.stage === 'annulees' ? (
                  <div className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#a64c26]" />
                    <div>
                      <p className="text-sm text-[#2b1c13]">Commande annulee</p>
                      <p className="text-xs text-[#8b7565]">{formatDateShort(selectedOrder.rawDate)}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
