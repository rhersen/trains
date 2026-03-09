export function isConnectTimeout(err) {
	return (
		typeof err === 'object' &&
		err !== null &&
		typeof err.cause === 'object' &&
		err.cause !== null &&
		(err.cause.code === 'UND_ERR_CONNECT_TIMEOUT' || err.cause.code === 'ETIMEDOUT')
	);
}
