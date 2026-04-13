export default function RegisterForm({
  formData,
  onChange,
  onSubmit,
  loading = false,
  fieldErrors = {},
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold">Nom</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          className="input"
          required
          disabled={loading}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          className="input"
          required
          disabled={loading}
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            className="input"
            required
            disabled={loading}
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Confirmation</label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={onChange}
            className="input"
            required
            disabled={loading}
          />
          {fieldErrors.password_confirmation && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password_confirmation}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Inscription...' : 'Créer un compte'}
      </button>
    </form>
  );
}
