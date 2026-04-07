import ProductCard from './ProductCard';
import Spinner from '../common/Spinner';

export default function ProductList({ products = [], loading = false, error = null }) {
  if (loading) {
    return (
      <div className="py-16">
        <Spinner size="xl" />
        <p className="mt-4 text-center text-gray-600">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-xl border border-[#dccfbf] bg-[#f5ede6] p-8 text-center">
        <p className="text-lg font-semibold text-[#4e3f35]">Aucun produit trouvé</p>
        <p className="mt-2 text-[#7b6a5d]">Essayez de modifier vos filtres de recherche</p>
      </div>
    );
  }

  return (
    <div className="product-catalog-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
