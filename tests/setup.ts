import "@testing-library/jest-dom/vitest";

// jsdom doesn't ship IntersectionObserver but framer-motion's whileInView uses
// it. Provide a no-op polyfill so tests that render motion components can mount.
if (typeof globalThis.IntersectionObserver === "undefined") {
	class MockIntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() {
			return [] as IntersectionObserverEntry[];
		}
		root = null;
		rootMargin = "";
		thresholds = [] as ReadonlyArray<number>;
	}
	// @ts-expect-error — jsdom global typing doesn't include this constructor.
	globalThis.IntersectionObserver = MockIntersectionObserver;
}

// matchMedia is used by next-themes / framer-motion's reduced-motion checks.
if (typeof window !== "undefined" && typeof window.matchMedia === "undefined") {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}) as MediaQueryList;
}
