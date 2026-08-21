import _ from 'lodash';

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

export function forServiceDate(announcements, date) {
	const current = announcements.filter((announcement) =>
		announcement.ScheduledDepartureDateTime?.startsWith(date)
	);
	const currentLocations = new Set(current.map(({ LocationSignature }) => LocationSignature));
	const fallback = newestAnnouncementByLocation(
		announcements.filter(
			(announcement) =>
				!announcement.ScheduledDepartureDateTime?.startsWith(date) &&
				!currentLocations.has(announcement.LocationSignature)
		)
	).map((announcement) => templateForDate(announcement, date));

	return filter([...current, ...fallback]).sort(compareAnnouncements);
}

const newestAnnouncementByLocation = (announcements) =>
	_.map(_.groupBy(announcements, 'LocationSignature'), (announcementsAtLocation) =>
		_.maxBy(announcementsAtLocation, 'ScheduledDepartureDateTime')
	);

const templateForDate = (announcement, date) => ({
	..._.omit(announcement, [
		'TimeAtLocation',
		'TimeAtLocationWithSeconds',
		'EstimatedTimeAtLocation',
		'Deviation'
	]),
	AdvertisedTimeAtLocation: withDate(announcement.AdvertisedTimeAtLocation, date),
	ScheduledDepartureDateTime: withDate(announcement.ScheduledDepartureDateTime, date)
});

const withDate = (value, date) => date + value.slice(10);

function compareAnnouncements(a, b) {
	if (a.AdvertisedTimeAtLocation < b.AdvertisedTimeAtLocation) return -1;
	if (a.AdvertisedTimeAtLocation > b.AdvertisedTimeAtLocation) return 1;
	return a.ActivityType.localeCompare(b.ActivityType);
}
