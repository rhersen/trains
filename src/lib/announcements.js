export function filter(announcements) {
	const last = announcements.findLast(({ TimeAtLocationWithSeconds }) => TimeAtLocationWithSeconds);
	return announcements.filter(
		({ ActivityType, LocationSignature, TimeAtLocationWithSeconds, ToLocation = [] }) =>
			(last && TimeAtLocationWithSeconds === last.TimeAtLocationWithSeconds) ||
			ActivityType === 'Avgang' ||
			ToLocation.some(({ LocationName }) => LocationName === LocationSignature)
	);
}
