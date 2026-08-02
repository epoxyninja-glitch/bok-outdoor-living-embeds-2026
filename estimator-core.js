export const PERGOLA_RATES = Object.freeze({
  aluminum: 60,
  wood: 45,
});

export const SQFT_LIMITS = Object.freeze({
  min: 80,
  max: 5000,
  default: 320,
});

const RANGE_MULTIPLIERS = Object.freeze({
  low: 0.92,
  high: 1.1,
});

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
}

export function normaliseSquareFeet(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return SQFT_LIMITS.default;

  return Math.min(
    SQFT_LIMITS.max,
    Math.max(SQFT_LIMITS.min, Math.round(numericValue)),
  );
}

function roundToNearestFifty(value) {
  return Math.round(value / 50) * 50;
}

export function calculatePergolaPlanningRange({ material, squareFeet }) {
  if (!(material in PERGOLA_RATES)) {
    throw new Error("Choose a valid pergola material.");
  }

  const normalisedSquareFeet = normaliseSquareFeet(squareFeet);
  const rate = PERGOLA_RATES[material];
  const startingPoint = normalisedSquareFeet * rate;

  return {
    material,
    squareFeet: normalisedSquareFeet,
    rate,
    startingPoint,
    low: roundToNearestFifty(startingPoint * RANGE_MULTIPLIERS.low),
    high: roundToNearestFifty(startingPoint * RANGE_MULTIPLIERS.high),
  };
}

function cleanField(value, maxLength = 180) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function createLeadMessage({
  projectType,
  material,
  squareFeet,
  name,
  phone,
  email,
  notes,
}) {
  const friendlyName = cleanField(name, 80) || "Website visitor";
  const contactPhone = cleanField(phone, 50) || "Not provided";
  const contactEmail = cleanField(email, 120) || "Not provided";
  const projectNotes = cleanField(notes, 320) || "No additional notes provided.";

  if (projectType === "kitchen") {
    const kitchenEstimate = calculateKitchenPlanningRange({
      counterSquareFeet: squareFeet,
      grill: material,
    });
    return [
      "Outdoor kitchen planning request",
      `Name: ${friendlyName}`,
      `Phone: ${contactPhone}`,
      `Email: ${contactEmail}`,
      `Approx. counter/island area: ${kitchenEstimate.counterSquareFeet.toLocaleString()} sq ft`,
      `Grill selection: ${kitchenEstimate.grillLabel}`,
      `Planning range shown: ${formatCurrency(kitchenEstimate.low)}\u2013${formatCurrency(kitchenEstimate.high)}`,
      `Project notes: ${projectNotes}`,
      "I understand plumbing, electrical, doors/drawers, tile or stone cladding, and site conditions are quoted after a site review, and this is an initial planning range, not a final quote.",
    ].join("\n");
  }

  const estimate = calculatePergolaPlanningRange({ material, squareFeet });
  const materialLabel = material === "aluminum" ? "Aluminum Pergola" : "Wood Pergola";

  return [
    "Pergola planning request",
    `Name: ${friendlyName}`,
    `Phone: ${contactPhone}`,
    `Email: ${contactEmail}`,
    `Material: ${materialLabel}`,
    `Approx. area: ${estimate.squareFeet.toLocaleString()} sq ft`,
    `Planning range shown: ${formatCurrency(estimate.low)}–${formatCurrency(estimate.high)}`,
    `Project notes: ${projectNotes}`,
    "I understand this is an initial planning range, not a final quote.",
  ].join("\n");
}

/* ---- Outdoor kitchen planning (added Aug 2026, client pricing) ---- */

export const KITCHEN_PRICING = Object.freeze({
  structurePerSqIn: 1.25,
  graniteFabPerSqIn: 0.25,
  granitePerSlab: 1200,
  slabYieldSqFt: 40,
});

export const KITCHEN_GRILLS = Object.freeze({
  none: { label: "No grill yet", price: 0 },
  napoleon: { label: 'Napoleon 32" (700 Series)', price: 2200 },
  deltaheat: { label: 'Delta Heat 32"', price: 3200 },
  twineagles: { label: 'Twin Eagles 30"', price: 5900 },
});

export const COUNTER_LIMITS = Object.freeze({
  min: 20,
  max: 300,
  default: 60,
});

export function normaliseCounterSquareFeet(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return COUNTER_LIMITS.default;
  return Math.min(COUNTER_LIMITS.max, Math.max(COUNTER_LIMITS.min, Math.round(numericValue)));
}

export function calculateKitchenPlanningRange({ counterSquareFeet, grill }) {
  const grillKey = grill in KITCHEN_GRILLS ? grill : "none";
  const sqFt = normaliseCounterSquareFeet(counterSquareFeet);
  const sqIn = sqFt * 144;
  const structure = sqIn * KITCHEN_PRICING.structurePerSqIn;
  const graniteFab = sqIn * KITCHEN_PRICING.graniteFabPerSqIn;
  const slabs = Math.max(1, Math.ceil(sqFt / KITCHEN_PRICING.slabYieldSqFt));
  const graniteMaterial = slabs * KITCHEN_PRICING.granitePerSlab;
  const grillPrice = KITCHEN_GRILLS[grillKey].price;
  const startingPoint = structure + graniteFab + graniteMaterial + grillPrice;

  return {
    counterSquareFeet: sqFt,
    grill: grillKey,
    grillLabel: KITCHEN_GRILLS[grillKey].label,
    slabs,
    startingPoint,
    low: Math.round((startingPoint * 0.92) / 50) * 50,
    high: Math.round((startingPoint * 1.1) / 50) * 50,
  };
}
