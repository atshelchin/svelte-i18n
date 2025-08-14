import { deLocalizeUrl } from '$lib/index.js';

export const reroute = (request: { url: URL }) => {
	return deLocalizeUrl(request.url).pathname;
};
