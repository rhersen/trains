export function text(announcements) {
	return announcements
		.map(({ ActivityType, AdvertisedTimeAtLocation, TimeAtLocationWithSeconds }) => {
			if (TimeAtLocationWithSeconds) {
				return ActivityType.substring(0, 3) + TimeAtLocationWithSeconds.substring(11, 19);
			} else {
				return ActivityType.substring(0, 3) + AdvertisedTimeAtLocation.substring(11, 16);
			}
		})
		.join(' ');
}

export function color(announcements) {
	if (!announcements[0]) return 'black';
	if (announcements.length === 1) {
		if (announcements[0].ActivityType === 'Ankomst') return 'yellow';
		if (announcements[0].ActivityType === 'Avgang') return 'lightgreen';
	}
	if (announcements[0].TimeAtLocationWithSeconds && announcements[1].TimeAtLocationWithSeconds)
		return 'green';
	if (!announcements[0].TimeAtLocationWithSeconds && !announcements[1].TimeAtLocationWithSeconds)
		return 'gray';
	return 'orange';
}
