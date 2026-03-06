export function filter(announcements) {
	return announcements.filter((announcement) => {
		if (announcement.ActivityType === 'Avgang') return true;
		const ankomst = announcement;
		const avgang = announcements.find(matchesAvgangFor(ankomst));
		return !avgang || (ankomst.TimeAtLocationWithSeconds && !avgang.TimeAtLocationWithSeconds);
	});
}

const matchesAvgangFor = (a) => (b) =>
	b.ActivityType === 'Avgang' &&
	a.LocationSignature === b.LocationSignature &&
	a.AdvertisedTimeAtLocation === b.AdvertisedTimeAtLocation;
