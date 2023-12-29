import { differenceInSeconds, parseISO } from 'date-fns';

export function delay(a) {
	if (age() > 200) return 'inactive';
	const delay = seconds();
	if (delay < 30) return 'delay-0';
	if (delay < 120) return 'delay-1-min';
	if (delay < 240) return 'delay-3-min';
	if (delay < 480) return 'delay-5-min';
	if (delay < 800) return 'delay-10-min';
	return 'delay-15-min';

	function seconds() {
		return differenceInSeconds(
			parseISO(a.TimeAtLocationWithSeconds),
			parseISO(a.AdvertisedTimeAtLocation)
		);
	}

	function age() {
		return differenceInSeconds(new Date(), parseISO(a.TimeAtLocationWithSeconds));
	}
}
