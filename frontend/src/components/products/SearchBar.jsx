export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Rechercher un produit...' }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="flex items-center gap-2"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="input"
        aria-label="Recherche produit"
      />
      <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
        Rechercher
      </button>
    </form>
  );
}

