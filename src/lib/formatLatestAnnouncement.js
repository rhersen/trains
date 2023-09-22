import _ from 'lodash';
import { differenceInSeconds, parseISO } from 'date-fns';
import locations from '$lib/filtered.json';

export function line1(a) {
	if (!a) return 'Aktuell information saknas';

	return `${id(a)} mot ${_.map(_.map(a.ToLocation, 'LocationName'), (loc) =>
		stationName(loc)
	)} ${precision(a)}`;
}

export function line2(a) {
	if (!a) return 'line2';

	return `${activity(a)} ${location(a)} kl ${a.TimeAtLocationWithSeconds.substring(11, 19)}`;

	function location(announcement) {
		return stationName(announcement.LocationSignature);
	}
}

export function classNew(a) {
	const secondsAgo = differenceInSeconds(new Date(), parseISO(a.TimeAtLocationWithSeconds));
	return secondsAgo < 30 ? 'new' : 'old';
}

function id(a) {
	return a.AdvertisedTrainIdent;
}

function stationName(locationSignature) {
	return locations[locationSignature]?.AdvertisedShortLocationName ?? locationSignature;
}

function precision(a) {
	const delay = differenceInSeconds(
		parseISO(a.TimeAtLocationWithSeconds),
		parseISO(a.AdvertisedTimeAtLocation)
	);

	if (delay > 120) return `${Math.trunc(delay / 60)} minuter sent`;
	if (delay > 30) return `${delay}s sent`;
	if (delay < -60) return 'i god tid';
	return 'i tid';
}

function activity(a) {
	return a.ActivityType === 'Ankomst' ? 'ank' : 'avg';
}
