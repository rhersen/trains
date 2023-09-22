import _ from 'lodash';

export default function ({ announcements }) {
	return _.groupBy(announcements, (announcement) =>
		announcement.AdvertisedTimeAtLocation.substring(0, 13)
	);
}
