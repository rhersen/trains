export function handle({ event, resolve }) {
	if (event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(null, { status: 204 });
	}

	return resolve(event);
}
