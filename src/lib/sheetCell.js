export function text(as) {
	if (as.length === 2) {
		if (as.every(seconds))
			return as
				.filter((a) => activity(a) === 'Avgang')
				.map((a) => `${seconds(a).substring(11, 19)}`)
				.join();

		if (!as.some(seconds)) {
			if (time(as[0]) === time(as[1])) return time(as[0]).substring(11, 16);
			else return time(as[0]).substring(11, 16) + '/' + time(as[1]).substring(14, 16);
		}

		return (
			activity(as[0]).substring(0, 3) +
			(seconds(as[0]) ? seconds(as[0]).substring(11, 19) : time(as[0]).substring(11, 16)) +
			' ' +
			(seconds(as[1]) ? seconds(as[1]).substring(11, 19) : time(as[1]).substring(11, 16))
		);
	}

	if (as.length === 1 && activity(as[0]) === 'Avgang' && seconds(as[0]))
		return seconds(as[0]).substring(11, 19);

	return as
		.map(
			(a) =>
				activity(a).substring(0, 3) +
				(seconds(a) ? seconds(a).substring(11, 19) : time(a).substring(11, 16))
		)
		.join(' ');
}

export function color([a0, a1]) {
	if (!a0) return 'black';
	if (!a1) return activity(a0) === 'Ankomst' ? 'yellow' : 'lightgreen';
	if (seconds(a0) && seconds(a1)) return 'green';
	if (!seconds(a0) && !seconds(a1)) return 'gray';

	return 'orange';
}

function time({ AdvertisedTimeAtLocation }) {
	return AdvertisedTimeAtLocation;
}

function seconds({ TimeAtLocationWithSeconds }) {
	return TimeAtLocationWithSeconds;
}

function activity({ ActivityType }) {
	return ActivityType;
}
