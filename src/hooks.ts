import { deLocalizeUrl } from '$lib/index.js';

export const reroute = (request: { url: URL }) => {
	console.log(request.url, deLocalizeUrl(request.url));
	return deLocalizeUrl(request.url).pathname;
};
