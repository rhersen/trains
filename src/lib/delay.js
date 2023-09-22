export function color({ AdvertisedTimeAtLocation, TimeAtLocationWithSeconds }) {
	if (!TimeAtLocationWithSeconds) {
		return '';
	}
	const delay =
		(Date.parse(TimeAtLocationWithSeconds) - Date.parse(AdvertisedTimeAtLocation)) * 1e-3;

	if (delay < 30) return 'hsl(100deg 100% 75%)';
	if (delay < 120) return 'hsl(80deg 100% 75%)';
	if (delay < 240) return 'hsl(60deg 100% 75%)';
	if (delay < 480) return 'hsl(40deg 100% 75%)';
	if (delay < 800) return 'hsl(20deg 100% 75%)';
	return 'hsl(0deg 100% 50%)';
}
