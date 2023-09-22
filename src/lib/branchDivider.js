import * as wgs from './wgs';

export default (announcement) => {
	if (!announcement) return '';
	const location = announcement.LocationSignature;
	const north = wgs.north(location);
	if (!north) return '';

	return north > 59.354 ? n() : s();

	function n() {
		if (north > 59.64) return 'ne';
		if (north > 59.407) return `n${leftRight(17.84)}`;
		return `n${leftRight(18.001)}`;
	}

	function s() {
		if (north < 59.17) return `s${leftRight(17.84)}`;
		if (north < 59.27) return `s${leftRight(18)}`;
		return 'c';
	}

	function leftRight(limit) {
		const east = wgs.east(location);
		if (!east) return '';
		return east < limit ? 'w' : 'e';
	}
};
