import { writable } from 'svelte/store';

export const page = writable({
	url: new URL('http://localhost'),
	params: {},
	route: { id: '/' },
	status: 200,
	error: null,
	data: {},
	form: undefined,
	state: {}
});

export const navigating = writable(null);
export const updated = writable({ check: async () => false });
