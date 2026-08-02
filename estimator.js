import {
  COUNTER_LIMITS,
  SQFT_LIMITS,
  calculateKitchenPlanningRange,
  calculatePergolaPlanningRange,
  createLeadMessage,
  formatCurrency,
  normaliseCounterSquareFeet,
  normaliseSquareFeet,
} from "./estimator-core.js";

const state = {
  projectType: "pergola",
  material: "aluminum",
  grill: "none",
  squareFeet: SQFT_LIMITS.default,
  counterSquareFeet: COUNTER_LIMITS.default,
};

const elements = {
  projectButtons: [...document.querySelectorAll("[data-project]")],
  materialButtons: [...document.querySelectorAll("[data-material]")],
  squareFeetRange: document.querySelector("#square-feet-range"),
  squareFeetNumber: document.querySelector("#square-feet-number"),
  squareFeetLabel: document.querySelector("#sqft-label"),
  squareFeetHelper: document.querySelector("#sqft-helper"),
  materialSection: document.querySelector("#material-section"),
  grillSection: document.querySelector("#grill-section"),
  grillButtons: [...document.querySelectorAll("[data-grill]")],
  estimatePanel: document.querySelector("#estimate-panel"),
  estimateLabel: document.querySelector("#estimate-label"),
  estimateRange: document.querySelector("#estimate-range"),
  estimateContext: document.querySelector("#estimate-context"),
  estimateDisclaimer: document.querySelector("#estimate-disclaimer"),
  leadTitle: document.querySelector("#lead-title"),
  leadForm: document.querySelector("#lead-form"),
  handoff: document.querySelector("#handoff"),
  copyButton: document.querySelector("#copy-inquiry"),
  copyStatus: document.querySelector("#copy-status"),
};

let preparedMessage = "";

function updatePressedState(buttons, selectedValue, dataKey) {
  buttons.forEach((button) => {
    const selected = button.dataset[dataKey] === selectedValue;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function setSquareFeet(nextValue) {
  if (state.projectType === "kitchen") {
    state.counterSquareFeet = normaliseCounterSquareFeet(nextValue);
    elements.squareFeetNumber.value = state.counterSquareFeet;
    elements.squareFeetRange.value = state.counterSquareFeet;
  } else {
    state.squareFeet = normaliseSquareFeet(nextValue);
    elements.squareFeetNumber.value = state.squareFeet;
    elements.squareFeetRange.value = Math.min(2000, state.squareFeet);
  }
  renderEstimate();
}

function applySliderLimits() {
  const isPergola = state.projectType === "pergola";
  if (isPergola) {
    elements.squareFeetRange.min = String(SQFT_LIMITS.min);
    elements.squareFeetRange.max = "2000";
    elements.squareFeetNumber.min = String(SQFT_LIMITS.min);
    elements.squareFeetNumber.max = String(SQFT_LIMITS.max);
    elements.squareFeetRange.value = Math.min(2000, state.squareFeet);
    elements.squareFeetNumber.value = state.squareFeet;
  } else {
    elements.squareFeetRange.min = String(COUNTER_LIMITS.min);
    elements.squareFeetRange.max = String(COUNTER_LIMITS.max);
    elements.squareFeetNumber.min = String(COUNTER_LIMITS.min);
    elements.squareFeetNumber.max = String(COUNTER_LIMITS.max);
    elements.squareFeetRange.value = state.counterSquareFeet;
    elements.squareFeetNumber.value = state.counterSquareFeet;
  }
}

function renderEstimate() {
  const isPergola = state.projectType === "pergola";
  elements.materialSection.hidden = !isPergola;
  if (elements.grillSection) elements.grillSection.hidden = isPergola;
  elements.estimatePanel.classList.toggle("is-consult", false);
  elements.squareFeetLabel.textContent = isPergola ? "2. Approximate pergola area" : "2. Approximate counter/island area";
  elements.squareFeetHelper.textContent = isPergola
    ? "Adjust to the closest usable square footage."
    : "Countertop and island footprint. Structure and granite are planned from this area.";
  elements.leadTitle.textContent = "4. Send your project starting point";

  if (!isPergola) {
    const estimate = calculateKitchenPlanningRange({
      counterSquareFeet: state.counterSquareFeet,
      grill: state.grill,
    });
    const grillPhrase = estimate.grill === "none"
      ? "with no grill selected yet"
      : `plus a ${estimate.grillLabel} grill`;
    elements.estimateLabel.textContent = "Initial outdoor-kitchen planning range";
    elements.estimateRange.textContent = `${formatCurrency(estimate.low)}\u2013${formatCurrency(estimate.high)}`;
    elements.estimateContext.textContent = `Based on structure at $1.25/sq in and level\u20111 granite ($0.25/sq in fabrication plus $1,200 per slab, estimated ${estimate.slabs} slab${estimate.slabs === 1 ? "" : "s"} at roughly 40 usable sq ft each) for ${estimate.counterSquareFeet.toLocaleString()} sq ft of counter, ${grillPhrase}. A site review is needed to confirm the final scope.`;
    elements.estimateDisclaimer.textContent = "This planning range is not a final quote and does not establish pricing. Plumbing, electrical, doors and drawers, tile or stone cladding, permitting, utilities, larger grill sizes, upgraded granite levels, and project-specific site conditions are quoted after a site review.";
    return;
  }

  const estimate = calculatePergolaPlanningRange(state);
  const materialLabel = state.material === "aluminum" ? "Aluminum Pergola" : "Wood Pergola";
  elements.estimateLabel.textContent = "Initial pergola planning range";
  elements.estimateRange.textContent = `${formatCurrency(estimate.low)}–${formatCurrency(estimate.high)}`;
  elements.estimateContext.textContent = `Based on an ${materialLabel} planning input of ${formatCurrency(estimate.rate)}/sq ft for ${estimate.squareFeet.toLocaleString()} sq ft. A site review is needed to confirm the final scope.`;
  elements.estimateDisclaimer.textContent = "This planning range is not a final quote and does not establish pricing. Permitting, engineering, electrical, lighting, site preparation, finishes, appliances, utilities, and project-specific conditions may affect the final scope.";
}

elements.projectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.projectType = button.dataset.project;
    updatePressedState(elements.projectButtons, state.projectType, "project");
    elements.handoff.classList.remove("is-visible");
    applySliderLimits();
    renderEstimate();
  });
});

elements.materialButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.material = button.dataset.material;
    updatePressedState(elements.materialButtons, state.material, "material");
    elements.handoff.classList.remove("is-visible");
    renderEstimate();
  });
});

elements.grillButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.grill = button.dataset.grill;
    updatePressedState(elements.grillButtons, state.grill, "grill");
    elements.handoff.classList.remove("is-visible");
    renderEstimate();
  });
});

elements.squareFeetRange.addEventListener("input", (event) => setSquareFeet(event.target.value));
elements.squareFeetNumber.addEventListener("change", (event) => setSquareFeet(event.target.value));
elements.squareFeetNumber.addEventListener("blur", (event) => setSquareFeet(event.target.value));

elements.leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.leadForm.reportValidity()) return;

  const formData = new FormData(elements.leadForm);
  const message = createLeadMessage({
    projectType: state.projectType,
    material: state.projectType === "kitchen" ? state.grill : state.material,
    squareFeet: state.projectType === "kitchen" ? state.counterSquareFeet : state.squareFeet,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    notes: formData.get("notes"),
  });

  preparedMessage = message;
  elements.copyStatus.hidden = true;
  elements.handoff.classList.add("is-visible");
  elements.handoff.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

elements.copyButton.addEventListener("click", async () => {
  if (!preparedMessage) return;

  try {
    await navigator.clipboard.writeText(preparedMessage);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = preparedMessage;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }

  elements.copyStatus.textContent = "Project summary copied. Scroll to the contact form below, paste it in, and send it to BOK when you are ready.";
  elements.copyStatus.hidden = false;
});

renderEstimate();
