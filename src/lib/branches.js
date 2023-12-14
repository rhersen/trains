import _ from 'lodash';
import * as wgs from './wgs';
import branchDivider from '$lib/branchDivider.js';

export default function branches(TrainAnnouncement) {
	return _.groupBy(currentTrains(TrainAnnouncement), (train) => branchDivider(train.latest));
}

function currentTrains(announcement) {
	const grouped = _.groupBy(announcement, 'AdvertisedTrainIdent');
	const includingUndefineds = _.map(grouped, selectLatest);
	const noUndefineds = _.filter(includingUndefineds, 'latest');
	const sorted = sortTrains(noUndefineds, direction(announcement));
	return _.filter(_.reject(sorted, hasArrivedAtDestination), isPendel);

	function selectLatest(trainAnnouncements) {
		return {
			latest: getLatest(trainAnnouncements),
			latestDeparture: getLatest(_.filter(trainAnnouncements, { ActivityType: 'Avgang' }))
		};
	}

	function getLatest(trainAnnouncements) {
		return getTrainAnnouncement(
			_.maxBy(trainAnnouncements, 'TimeAtLocationWithSeconds'),
			trainAnnouncements
		);
	}

	function getTrainAnnouncement(trainAnnouncement, trainAnnouncements) {
		return !trainAnnouncement
			? undefined
			: !trainAnnouncement.ToLocation
			? addToLocation(trainAnnouncements, trainAnnouncement)
			: trainAnnouncement;
	}

	function addToLocation(trainAnnouncements, trainAnnouncement) {
		const found = _.find(trainAnnouncements, 'ProductInformation');
		return found
			? {
					...trainAnnouncement,
					ProductInformation: found.ProductInformation,
					ToLocation: found.ToLocation
			  }
			: trainAnnouncement;
	}

	function direction(announcements) {
		return announcements.length > 0 && /\d\d\d[13579]/.test(announcements[0].AdvertisedTrainIdent);
	}

	function hasArrivedAtDestination({ latest }) {
		if (!latest) return false;
		if (latest.LocationSignature === 'Söd') return true;
		if (latest.LocationSignature === 'Mr') return true;
		if (latest.LocationSignature === 'Bvr') return true;
		if (latest.LocationSignature === 'Khä') return true;
		if (latest.LocationSignature === 'Vhe') return true;
		if (latest.ActivityType !== 'Ankomst') return false;
		return _.map(latest.ToLocation, 'LocationName').join() === latest.LocationSignature;
	}

	function isPendel(train) {
		if (!train.latest) return false;
		return train.latest.ToLocation && train.latest.ToLocation.length > 0;
	}

	function sortTrains(obj, dir) {
		return _.orderBy(
			obj,
			[
				(a) => north(a.latest ? a.latest.LocationSignature : ''),
				'latest.ActivityType',
				'latest.TimeAtLocation'
			],
			['desc', dir ? 'asc' : 'desc', dir ? 'desc' : 'asc']
		);
	}

	function north(location) {
		if (location === 'Gdv') return between('Ngd', 'Nyh');
		if (location === 'Söc') return between('Söd', 'Söu');
		if (location === 'Gn') return between('Mö', 'Ssä');
		return wgs.north(location);
	}

	function between(loc1, loc2) {
		return 0.5 * wgs.north(loc1) + 0.5 * wgs.north(loc2);
	}
}
