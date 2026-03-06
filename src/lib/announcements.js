export function filter(announcements) {
	const statsByKey = announcements.reduce(
		(m, a) => ({
			...m,
			[k(a)]: {
				count: (m[k(a)]?.count ?? 0) + 1,
				noAvgangYet: a.ActivityType === 'Avgang' && !a.TimeAtLocationWithSeconds
			}
		}),
		{}
	);

	return announcements.filter((a) => {
		if (a.ActivityType === 'Avgang') return true;

		const { count, noAvgangYet } = statsByKey[k(a)];

		return count === 1 || (a.TimeAtLocationWithSeconds && noAvgangYet);
	});
}

function k({ LocationSignature, AdvertisedTimeAtLocation }) {
	return `${LocationSignature}__${AdvertisedTimeAtLocation}`;
}
