export function getNextSlide(currentIndex, totalSlides) {
  if (!Number.isInteger(currentIndex) || !Number.isInteger(totalSlides) || totalSlides < 1) {
    throw new Error("A valid current index and a positive slide count are required.");
  }
  return (currentIndex + 1) % totalSlides;
}

export function getPreviousSlide(currentIndex, totalSlides) {
  if (!Number.isInteger(currentIndex) || !Number.isInteger(totalSlides) || totalSlides < 1) {
    throw new Error("A valid current index and a positive slide count are required.");
  }
  return (currentIndex - 1 + totalSlides) % totalSlides;
}

export function shouldAutoplay({ reducedMotion, pausedByVisitor }) {
  return !reducedMotion && !pausedByVisitor;
}
