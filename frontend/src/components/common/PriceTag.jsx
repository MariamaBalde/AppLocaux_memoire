export default function PriceTag({ amount, showCurrency = true, className = '' }) {
  const formatted = amount.toLocaleString('fr-FR', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: showCurrency ? 'XOF' : undefined,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return <span className={className}>{formatted}</span>;
}
