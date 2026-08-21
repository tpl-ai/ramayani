const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4,
  '⅛': 1 / 8, '⅜': 3 / 8, '⅝': 5 / 8, '⅞': 7 / 8,
  '⅕': 1 / 5, '⅖': 2 / 5, '⅗': 3 / 5, '⅘': 4 / 5, '⅙': 1 / 6, '⅚': 5 / 6,
};

interface ParsedAmount {
  value: number;
  approx: boolean;
}

/**
 * Parses a simple leading numeric amount (int/decimal/fraction/mixed number,
 * optional leading '±'). Returns null for anything more complex (ranges,
 * "secukupnya"/"to taste", compound "x"/dash amounts) -- those are displayed
 * as authored, unscaled and unconverted.
 */
export function parseAmount(amount: string): ParsedAmount | null {
  let s = amount.trim();
  if (!s) return null;
  let approx = false;
  if (s.startsWith('±')) {
    approx = true;
    s = s.slice(1).trim();
  }

  let m = s.match(/^(\d+)?\s*([½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚])$/);
  if (m) {
    const whole = m[1] ? Number(m[1]) : 0;
    return { value: whole + UNICODE_FRACTIONS[m[2]], approx };
  }

  m = s.match(/^(\d+)?\s*(\d+)\s*\/\s*(\d+)$/);
  if (m) {
    const whole = m[1] ? Number(m[1]) : 0;
    return { value: whole + Number(m[2]) / Number(m[3]), approx };
  }

  if (/^\d+(\.\d+)?$/.test(s)) {
    return { value: Number(s), approx };
  }

  // Indonesian-style decimal comma, e.g. "1,25" -- a longer run like "1.500"
  // is an ambiguous thousands separator and is left unscaled below.
  m = s.match(/^(\d+),(\d{1,2})$/);
  if (m) {
    return { value: Number(`${m[1]}.${m[2]}`), approx };
  }

  return null;
}

function formatNumber(n: number): string {
  return String(Math.round(n * 10) / 10);
}

function formatAmount(parsed: ParsedAmount): string {
  const num = formatNumber(parsed.value);
  return parsed.approx ? `± ${num}` : num;
}

type Category = 'weight' | 'volume';
type System = 'metric' | 'imperial';

interface UnitInfo {
  category: Category;
  system: System;
  toBase: number; // multiply amount by this to get the base unit (g for weight, ml for volume)
}

const UNIT_TABLE: Record<string, UnitInfo> = {
  g: { category: 'weight', system: 'metric', toBase: 1 },
  gram: { category: 'weight', system: 'metric', toBase: 1 },
  gr: { category: 'weight', system: 'metric', toBase: 1 },
  kg: { category: 'weight', system: 'metric', toBase: 1000 },
  mg: { category: 'weight', system: 'metric', toBase: 0.001 },

  oz: { category: 'weight', system: 'imperial', toBase: 28.3495 },
  lb: { category: 'weight', system: 'imperial', toBase: 453.592 },
  lbs: { category: 'weight', system: 'imperial', toBase: 453.592 },

  ml: { category: 'volume', system: 'metric', toBase: 1 },
  cc: { category: 'volume', system: 'metric', toBase: 1 },
  l: { category: 'volume', system: 'metric', toBase: 1000 },

  cup: { category: 'volume', system: 'imperial', toBase: 236.588 },
  cups: { category: 'volume', system: 'imperial', toBase: 236.588 },
  tbsp: { category: 'volume', system: 'imperial', toBase: 14.7868 },
  tbls: { category: 'volume', system: 'imperial', toBase: 14.7868 },
  tbs: { category: 'volume', system: 'imperial', toBase: 14.7868 },
  tablespoon: { category: 'volume', system: 'imperial', toBase: 14.7868 },
  tablespoons: { category: 'volume', system: 'imperial', toBase: 14.7868 },
  sdm: { category: 'volume', system: 'imperial', toBase: 14.7868 },
  's/makan': { category: 'volume', system: 'imperial', toBase: 14.7868 },
  's/m': { category: 'volume', system: 'imperial', toBase: 14.7868 },
  's/besar': { category: 'volume', system: 'imperial', toBase: 14.7868 },
  tsp: { category: 'volume', system: 'imperial', toBase: 4.92892 },
  teaspoon: { category: 'volume', system: 'imperial', toBase: 4.92892 },
  sdt: { category: 'volume', system: 'imperial', toBase: 4.92892 },
  's/teh': { category: 'volume', system: 'imperial', toBase: 4.92892 },
  'fl oz': { category: 'volume', system: 'imperial', toBase: 29.5735 },
  gallon: { category: 'volume', system: 'imperial', toBase: 3785.41 },
  gallons: { category: 'volume', system: 'imperial', toBase: 3785.41 },
  galon: { category: 'volume', system: 'imperial', toBase: 3785.41 },
};

function lookupUnit(unit: string): UnitInfo | null {
  return UNIT_TABLE[unit.trim().toLowerCase()] ?? null;
}

function pickWeightUnit(grams: number, system: System): { amount: number; unit: string } {
  if (system === 'metric') {
    return grams >= 1000 ? { amount: grams / 1000, unit: 'kg' } : { amount: grams, unit: 'g' };
  }
  const oz = grams / 28.3495;
  return oz >= 16 ? { amount: grams / 453.592, unit: 'lbs' } : { amount: oz, unit: 'oz' };
}

function pickVolumeUnit(ml: number, system: System): { amount: number; unit: string } {
  if (system === 'metric') {
    return ml >= 1000 ? { amount: ml / 1000, unit: 'L' } : { amount: ml, unit: 'ml' };
  }
  if (ml >= 59) return { amount: Math.round((ml / 236.588) * 4) / 4, unit: 'cups' };
  if (ml >= 15) return { amount: Math.round((ml / 14.7868) * 2) / 2, unit: 'tbsp' };
  return { amount: Math.round(ml / 4.92892), unit: 'tsp' };
}

/**
 * Computes the display amount+unit for one ingredient line at a given
 * serving-size factor and target unit system. Falls back to the raw stored
 * amount/unit, scaled only if a simple leading number was parseable, when
 * the amount is too irregular (a range, "secukupnya"/"to taste", a compound
 * "x"/dash amount) or the unit has no metric<->imperial mapping (e.g. a
 * count unit like "buah", "kaleng", "potong").
 */
export function displayQuantity(
  amount: string,
  unit: string,
  factor: number,
  targetSystem: System,
): { amount: string; unit: string } {
  const info = lookupUnit(unit);
  const needsConversion = !!info && info.system !== targetSystem;

  // Nothing to scale and nothing to convert -- return the authored amount
  // untouched (e.g. don't reformat a fraction like "⅛" into "0.1").
  if (factor === 1 && !needsConversion) {
    return { amount, unit };
  }

  const parsed = parseAmount(amount);
  if (!parsed) {
    return { amount, unit };
  }
  const scaled: ParsedAmount = { value: parsed.value * factor, approx: parsed.approx };

  if (!needsConversion) {
    return { amount: formatAmount(scaled), unit };
  }

  const base = scaled.value * info!.toBase;
  const picked = info!.category === 'weight' ? pickWeightUnit(base, targetSystem) : pickVolumeUnit(base, targetSystem);
  const num = formatNumber(picked.amount);
  return { amount: scaled.approx ? `± ${num}` : num, unit: picked.unit };
}
