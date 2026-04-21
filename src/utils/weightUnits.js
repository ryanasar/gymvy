const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

// Round to nearest 0.5 for clean display (e.g. 60, 60.5, 61 — never 60.34)
const roundToHalf = (value) => Math.round(value * 2) / 2;

export const fromLbs = (value, unit) => {
  if (value == null || isNaN(value)) return null;
  if (unit === 'kg') return roundToHalf(value * LBS_TO_KG);
  return roundToHalf(value);
};

export const toLbs = (value, unit) => {
  if (value == null || isNaN(value)) return null;
  if (unit === 'kg') return roundToHalf(value * KG_TO_LBS);
  return value;
};

export const formatWeight = (value, unit) => {
  const converted = fromLbs(value, unit);
  if (converted == null) return null;
  // Show as integer if whole number, otherwise show .5
  return converted % 1 === 0 ? String(converted) : converted.toFixed(1);
};

export const getUnitLabel = (unit) => unit === 'kg' ? 'kg' : 'lbs';

export const getBodyWeightRange = (unit) => {
  if (unit === 'kg') return { min: 22, max: 227 };
  return { min: 50, max: 500 };
};
