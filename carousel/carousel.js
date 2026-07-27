import { getNextSlide, getPreviousSlide, shouldAutoplay } from "./carousel-core.mjs";

const carousel = document.querySelector("#portfolio-carousel");
const slides = Array.from(carousel.querySelectorAll(".carousel__slide"));
const dots = Array.from(carousel.querySelectorAll(".carousel__dot"));
const previousButton = carousel.querySelector('[data-action="previous"]');
const nextButton = carousel.querySelector('[data-action="next"]');
const toggleButton = carousel.querySelector('[data-action="toggle"]');
const status = carousel.querySelector("#carousel-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  activeIndex: 0,
  pausedByVisitor: false,
  pausedByInteraction: false,
  timer: null,
};

const totalSlides = slides.length;
const autoplayDelay = 6000;

function isPaused() {
  return state.pausedByVisitor || state.pausedByInteraction;
}

function updateStatus() {
  const automatic = shouldAutoplay({ reducedMotion: reducedMotion.matches, pausedByVisitor: isPaused() });
  status.textContent = `Slide ${state.activeIndex + 1} of ${totalSlides} · Auto-advance is ${automatic ? "on" : "paused"}`;
  toggleButton.setAttribute("aria-pressed", String(state.pausedByVisitor));
  toggleButton.setAttribute("aria-label", state.pausedByVisitor ? "Resume auto-advance" : "Pause auto-advance");
  toggleButton.textContent = state.pausedByVisitor ? "▶" : "Ⅱ";
}

function render(nextIndex) {
  state.activeIndex = nextIndex;
  slides.forEach((slide, index) => {
    const active = index === nextIndex;
    slide.setAttribute("aria-hidden", String(!active));
  });
  dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === nextIndex)));
  updateStatus();
}

function stopTimer() {
  if (state.timer) {
    window.clearInterval(state.timer);
    state.timer = null;
  }
}

function startTimer() {
  stopTimer();
  if (!shouldAutoplay({ reducedMotion: reducedMotion.matches, pausedByVisitor: isPaused() })) return;
  state.timer = window.setInterval(() => render(getNextSlide(state.activeIndex, totalSlides)), autoplayDelay);
}

function restartTimer() {
  updateStatus();
  startTimer();
}

previousButton.addEventListener("click", () => {
  state.pausedByVisitor = true;
  render(getPreviousSlide(state.activeIndex, totalSlides));
  restartTimer();
});

nextButton.addEventListener("click", () => {
  state.pausedByVisitor = true;
  render(getNextSlide(state.activeIndex, totalSlides));
  restartTimer();
});

toggleButton.addEventListener("click", () => {
  state.pausedByVisitor = !state.pausedByVisitor;
  restartTimer();
});

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    state.pausedByVisitor = true;
    render(index);
    restartTimer();
  });
});

carousel.addEventListener("pointerenter", () => {
  state.pausedByInteraction = true;
  restartTimer();
});

carousel.addEventListener("pointerleave", () => {
  state.pausedByInteraction = false;
  restartTimer();
});

carousel.addEventListener("focusin", () => {
  state.pausedByInteraction = true;
  restartTimer();
});

carousel.addEventListener("focusout", (event) => {
  if (!carousel.contains(event.relatedTarget)) {
    state.pausedByInteraction = false;
    restartTimer();
  }
});

carousel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    state.pausedByVisitor = true;
    render(getNextSlide(state.activeIndex, totalSlides));
    restartTimer();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    state.pausedByVisitor = true;
    render(getPreviousSlide(state.activeIndex, totalSlides));
    restartTimer();
  }
});

reducedMotion.addEventListener("change", restartTimer);

render(0);
startTimer();
