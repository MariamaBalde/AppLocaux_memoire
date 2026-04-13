export default function LoginForm({
  formData,
  onChange,
  onSubmit,
  loading = false,
  fieldErrors = {},
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
