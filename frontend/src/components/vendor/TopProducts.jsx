function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

export default function TopProducts({ products, darkMode }) {
  return (
    <section
      className={[
        'rounded-2xl border p-5 shadow-sm',
        darkMode ? 'border-amber-700/30 bg-[#2a160e]' : 'border-amber-100 bg-white',
      ].join(' ')}
    >
      <h3 className={['mb-4 text-lg font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
        Top produits
      </h3>

      {products.length === 0 ? (
        <p className={darkMode ? 'text-sm text-amber-200/80' : 'text-sm text-[#7c4f2a]'}>
          Aucun produit vendu sur cette période.
        </p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.name}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div>
                  <p className={['font-medium', darkMode ? 'text-amber-50' : 'text-[#2b1308]'].join(' ')}>
                    {product.name}
                  </p>
                  <p className={darkMode ? 'text-xs text-amber-200/70' : 'text-xs text-[#7c4f2a]'}>
                    {product.sales} ventes
                  </p>
                </div>
                <p className={['text-sm font-semibold', darkMode ? 'text-amber-100' : 'text-[#2b1308]'].join(' ')}>
                  {formatCurrency(product.revenue)}
                </p>
              </div>

              <div className={[
                'h-2 overflow-hidden rounded-full',
                darkMode ? 'bg-amber-900/40' : 'bg-amber-100',
              ].join(' ')}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                  style={{ width: `${product.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
