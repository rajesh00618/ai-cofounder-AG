import '@testing-library/jest-dom';

if (typeof IntersectionObserver === 'undefined') {
  class MockIntersectionObserver {
    constructor() {}
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
  }
  window.IntersectionObserver = MockIntersectionObserver;
  global.IntersectionObserver = MockIntersectionObserver;
}
