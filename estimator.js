import {
  SQFT_LIMITS,
  calculatePergolaPlanningRange,
  createLeadMessage,
  formatCurrency,
  normaliseSquareFeet,
} from "./estimator-core.js";

const state = {
  projectType: "pergola",
  material: "aluminum",
  squareFeet: SQFT_LIMITS.default,
};

const elements = {
  projectButtons: [...document.querySelectorAll("[data-project]")],
  materialButtons: [...document.querySelectorAll("[data-material]")],
  squareFeetRange: document.querySelector("#square-feet-range"),
  squareFeetNumber: document.querySelector("#square-feet-number"),
  squareFeetLabel: document.querySelector("#sqft-label"),
  squareFeetHelper: document.querySelector("#sqft-helper"),
  materialSection: document.querySelector("#material-section"),
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
  state.squareFeet = normaliseSquareFeet(nextValue);
  elements.squareFeetNumber.value = state.squareFeet;
  elements.squareFeetRange.value = Math.min(2000, state.squareFeet);
  renderEstimate();
}

function renderEstimate() {
  const isPergola = state.projectType === "pergola";
  elements.materialSection.hidden = !isPergola;
  elements.estimatePanel.classList.toggle("is-consult", !isPergola);
  elements.squareFeetLabel.textContent = isPergola ? "2. Approximate pergola area" : "2. Approximate project area";
  elements.squareFeetHelper.textContent = isPergola
    ? "Adjust to the closest usable square footage."
    : "This helps prepare for the planning conversation.";
  elements.leadTitle.textContent = isPergola ? "4. Send your project starting point" : "3. Start your kitchen conversation";

  if (!isPergola) {
    elements.estimateLabel.textContent = "Outdoor kitchen planning";
    elements.estimateRange.textContent = "Tailored to your project.";
    elements.estimateContext.textContent = "Appliances, utilities, finishes, layout, and site conditions all shape an outdoor-kitchen investment. Start with a short project conversation rather than an unreliable generic range.";
    elements.estimateDisclaimer.textContent = "No outdoor-kitchen price is shown here because the scope needs to be confirmed before a useful planning range can be prepared.";
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

elements.squareFeetRange.addEventListener("input", (event) => setSquareFeet(event.target.value));
elements.squareFeetNumber.addEventListener("change", (event) => setSquareFeet(event.target.value));
elements.squareFeetNumber.addEventListener("blur", (event) => setSquareFeet(event.target.value));

elements.leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.leadForm.reportValidity()) return;

  const formData = new FormData(elements.leadForm);
  const message = createLeadMessage({
    projectType: state.projectType,
    material: state.material,
    squareFeet: state.squareFeet,
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
