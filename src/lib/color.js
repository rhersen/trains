import { differenceInSeconds, parseISO } from 'date-fns';

export function delay(a) {
	if (age() > 300) return 'inactive';
	const delay = seconds();
	if (delay < 120) return 'delay-0';
	if (delay < 180) return 'delay-1-min';
	if (delay < 300) return 'delay-3-min';
	if (delay < 600) return 'delay-5-min';
	if (delay < 900) return 'delay-10-min';
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

export function position(train) {
	if (train) {
		const code = train.ProductInformation[0].Code;
		if (code === 'PNA014') return `hsl(0, 0%, 30%)`;
		const location = train.ToLocation?.map(({ LocationName }) => LocationName).join();
		if (location === 'Sci') return `hsl(0, 100%, 40%)`;
		if (location === 'U') return `hsl(30, 100%, 40%)`;
		if (location === 'Mr') return `hsl(60, 100%, 40%)`;
		if (location === 'Tu') return `hsl(120, 100%, 40%)`;
		if (location === 'Söc') return `hsl(180, 100%, 40%)`;

		if (location === 'Bål') return `hsl(0, 60%, 30%)`;
		if (location === 'Khä') return `hsl(60, 60%, 30%)`;
		if (location === 'Kän') return `hsl(30, 60%, 30%)`;
		if (location === 'Vhe') return `hsl(120, 60%, 30%)`;
		if (location === 'Nyc') return `hsl(180, 60%, 30%)`;
	}

	return `hsl(0, 0%, 70%)`;
}
