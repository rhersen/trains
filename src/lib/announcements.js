export function filter(announcements) {
	const m = getStatsMap(announcements);

	return announcements.filter((a) => {
		if (a.ActivityType === 'Avgang') return true;

		const { count, hasAvgangWithoutSeconds } = m.get(
			`${a.LocationSignature}__${a.AdvertisedTimeAtLocation}`
		);

		return count === 1 || (a.TimeAtLocationWithSeconds && hasAvgangWithoutSeconds);
	});
}

function getStatsMap(announcements) {
	const m = new Map();

	for (const a of announcements) {
		const key = `${a.LocationSignature}__${a.AdvertisedTimeAtLocation}`;
		m.set(key, getStats(m.get(key)?.count ?? 0, a.ActivityType, a.TimeAtLocationWithSeconds));
	}

	return m;
}

function getStats(count, ActivityType, TimeAtLocationWithSeconds) {
	return {
		count: count + 1,
		hasAvgangWithoutSeconds: ActivityType === 'Avgang' && !TimeAtLocationWithSeconds
	};
}
