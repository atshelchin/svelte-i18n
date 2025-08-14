export async function goto(url: string | URL) {
	console.log(`Mock navigation to: ${url}`);
	return Promise.resolve();
}

export async function invalidate(url: string | URL | ((url: URL) => boolean)) {
	console.log(`Mock invalidate: ${url}`);
	return Promise.resolve();
}

export async function invalidateAll() {
	console.log('Mock invalidateAll');
	return Promise.resolve();
}

export async function preloadCode(...urls: string[]) {
	console.log(`Mock preloadCode: ${urls.join(', ')}`);
	return Promise.resolve();
}

export async function preloadData(href: string) {
	console.log(`Mock preloadData: ${href}`);
	return Promise.resolve();
}
