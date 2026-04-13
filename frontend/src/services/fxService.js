const DEFAULT_RATES = {
  XOF: 1,
  EUR: 655.957,
  USD: 590,
};

function resolveRate(currency) {
  const key = `REACT_APP_FX_${currency}`;
  const fromEnv = Number(process.env[key]);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return DEFAULT_RATES[currency] || 1;
}

export const fxService = {
  getRate(currency) {
    return resolveRate(currency);
  },

  convertFromXof(amountXof, currency) {
    const amount = Number(amountXof || 0);
    const rate = resolveRate(currency);
    if (currency === 'XOF') return amount;
    return amount / rate;
  },
};

