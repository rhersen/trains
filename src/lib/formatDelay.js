import { differenceInSeconds, parseISO } from 'date-fns';

export default (announcement) => {
	if (!announcement.TimeAtLocationWithSeconds) return '';

	const number = differenceInSeconds(
		parseISO(announcement.TimeAtLocationWithSeconds),
		parseISO(announcement.AdvertisedTimeAtLocation)
	);

	if (number >= 60) return `${Math.round(number / 60)}m`;

	if (number >= 50) return '⅚';
	if (number >= 48) return '⅘';
	if (number >= 40) return '⅔';
	if (number >= 36) return '⅗';
	if (number >= 30) return '½';
	if (number >= 24) return '⅖';
	if (number >= 20) return '⅓';
	if (number >= 12) return '⅕';
	if (number >= 10) return '⅙';

	return '0';
};
