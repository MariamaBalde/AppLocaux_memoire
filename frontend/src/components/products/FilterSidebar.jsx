export default function FilterSidebar({
  filters,
  categories = [],
  onFilterChange,
  onApply,
  onReset,
}) {
  return (
    <div className="space-y-3 rounded-xl border border-[#dccfbf] bg-[#f8f3ed] p-4">
      <h3 className="text-sm font-semibold text-[#4e3f35]">Filtres</h3>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[#6f655c]">Catégorie</label>
        <select
          value={filters.category_id || ''}
          onChange={(event) => onFilterChange?.('category_id', event.target.value)}
          className="input"
        >
          <option value="">Toutes</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#6f655c]">Prix min</label>
          <input
            type="number"
            min="0"
            value={filters.price_min || ''}
            onChange={(event) => onFilterChange?.('price_min', event.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#6f655c]">Prix max</label>
          <input
            type="number"
            min="0"
            value={filters.price_max || ''}
            onChange={(event) => onFilterChange?.('price_max', event.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.delivery_local === 'true'}
            onChange={(event) => onFilterChange?.('delivery_local', event.target.checked ? 'true' : '')}
          />
          Livraison locale
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.delivery_intl === 'true'}
            onChange={(event) => onFilterChange?.('delivery_intl', event.target.checked ? 'true' : '')}
          />
          Expédition internationale
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onApply} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white">
          Appliquer
        </button>
        <button type="button" onClick={onReset} className="rounded-lg border border-[#c8beb3] bg-white px-3 py-2 text-xs font-semibold text-[#4e3f35]">
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

