import { differenceInSeconds, parseISO } from 'date-fns';

export default function color(a) {
	const delay = seconds();

	if (delay < 30) return 'lime';
	if (delay < 120) return 'white';
	if (delay < 240) return 'yellow';
	if (delay < 480) return 'darkorange';
	if (delay < 800) return 'orangered';
	return 'red';

	function seconds() {
		return differenceInSeconds(
			parseISO(a.TimeAtLocationWithSeconds),
			parseISO(a.AdvertisedTimeAtLocation)
		);
	}
}
