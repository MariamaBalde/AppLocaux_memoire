export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-danger rounded-lg p-6 text-center">
      <div className="text-4xl mb-2">⚠️</div>
      <p className="text-danger font-semibold mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 transition"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
