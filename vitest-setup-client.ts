/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

import { afterAll, afterEach } from 'vitest';

// Track all timeouts and intervals
const activeTimers = new Set<number>();

// Override setTimeout and setInterval to track them
if (typeof window !== 'undefined') {
	const originalSetTimeout = window.setTimeout;
	const originalSetInterval = window.setInterval;
	const originalClearTimeout = window.clearTimeout;
	const originalClearInterval = window.clearInterval;

	window.setTimeout = function (...args: any[]) {
		const id = originalSetTimeout.apply(window, args);
		activeTimers.add(id);
		return id;
	};

	window.setInterval = function (...args: any[]) {
		const id = originalSetInterval.apply(window, args);
		activeTimers.add(id);
		return id;
	};

	window.clearTimeout = function (id: number) {
		activeTimers.delete(id);
		return originalClearTimeout.call(window, id);
	};

	window.clearInterval = function (id: number) {
		activeTimers.delete(id);
		return originalClearInterval.call(window, id);
	};
}

// Clean up after each test
afterEach(async () => {
	// Clear all active timers
	for (const id of activeTimers) {
		clearTimeout(id);
		clearInterval(id);
	}
	activeTimers.clear();

	// Wait a tick for any pending microtasks
	await new Promise((resolve) => setTimeout(resolve, 0));
});

// Ensure clean shutdown
afterAll(async () => {
	// Final cleanup
	if (typeof window !== 'undefined') {
		// Clear any remaining timers
		for (const id of activeTimers) {
			clearTimeout(id);
			clearInterval(id);
		}
		activeTimers.clear();
	}

	// Give the browser time to clean up
	await new Promise((resolve) => setTimeout(resolve, 100));
});
