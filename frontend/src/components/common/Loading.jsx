export default function Loading({ message = 'Chargement en cours...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}
