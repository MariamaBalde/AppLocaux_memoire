function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusPill(status, darkMode) {
  if (status === 'delivered') return darkMode ? 'bg-green-700/30 text-green-200' : 'bg-green-100 text-green-700';
  if (status === 'shipped') return darkMode ? 'bg-blue-700/30 text-blue-200' : 'bg-blue-100 text-blue-700';
  if (status === 'processing') return darkMode ? 'bg-amber-700/30 text-amber-200' : 'bg-amber-100 text-amber-800';
  if (status === 'cancelled') return darkMode ? 'bg-red-700/30 text-red-200' : 'bg-red-100 text-red-700';
  return darkMode ? 'bg-orange-700/30 text-orange-100' : 'bg-orange-100 text-orange-700';
}

export default function OrdersTable({
  orders,
  pagination,
  darkMode,
  onPageChange,
}) {
  const hasOrders = Array.isArray(orders) && orders.length > 0;

  return (
    <section
      className={[
        'rounded-2xl border p-5 shadow-sm',
        darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
      ].join(' ')}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className={['text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
          Commandes récentes
        </h3>
        <span className={darkMode ? 'text-xs text-amber-200/80' : 'text-xs text-[#7c4f2a]'}>
          {pagination.totalOrders} total
        </span>
      </div>

      {!hasOrders ? (
        <div
          className={[
            'rounded-xl border border-dashed p-8 text-center text-sm',
            darkMode ? 'border-amber-600/40 text-amber-200/80' : 'border-amber-200 text-[#7c4f2a]',
          ].join(' ')}
        >
          Aucune commande sur ce filtre.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={darkMode ? 'text-amber-200/80' : 'text-[#7c4f2a]'}>
                  <th className="pb-3 text-left font-semibold">Client</th>
                  <th className="pb-3 text-left font-semibold">Produit</th>
                  <th className="pb-3 text-left font-semibold">Date</th>
                  <th className="pb-3 text-left font-semibold">Montant</th>
                  <th className="pb-3 text-left font-semibold">Statut</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={darkMode ? 'border-t border-amber-700/20' : 'border-t border-amber-100'}>
                    <td className={['py-3 font-medium', darkMode ? 'text-amber-50' : 'text-[#2b1308]'].join(' ')}>
                      {order.clientName}
                    </td>
                    <td className={darkMode ? 'py-3 text-amber-200/90' : 'py-3 text-[#5c361f]'}>
                      {order.productSummary || order.productName}
                    </td>
                    <td className={darkMode ? 'py-3 text-amber-200/70' : 'py-3 text-[#7c4f2a]'}>{formatDate(order.createdAt)}</td>
                    <td className={['py-3 font-semibold', darkMode ? 'text-amber-50' : 'text-[#2b1308]'].join(' ')}>
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill(order.status, darkMode)}`}>
                        {order.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className={[
                'rounded-lg px-3 py-1.5 text-sm',
                pagination.page <= 1
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'bg-primary text-white hover:bg-primary-dark',
              ].join(' ')}
            >
              Précédent
            </button>

            <span className={darkMode ? 'text-sm text-amber-200/80' : 'text-sm text-[#7c4f2a]'}>
              Page {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className={[
                'rounded-lg px-3 py-1.5 text-sm',
                pagination.page >= pagination.totalPages
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'bg-primary text-white hover:bg-primary-dark',
              ].join(' ')}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </section>
  );
}
