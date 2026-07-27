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
    return [
      "Outdoor kitchen consultation request",
      `Name: ${friendlyName}`,
      `Phone: ${contactPhone}`,
      `Email: ${contactEmail}`,
      `Approx. project area: ${normaliseSquareFeet(squareFeet).toLocaleString()} sq ft`,
      `Project notes: ${projectNotes}`,
      "Please follow up with a tailored planning conversation.",
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
