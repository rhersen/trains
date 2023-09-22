import locations from '$lib/filtered.json';

export function east(location) {
	const match = /POINT \(([\d\\.]+) ([\d\\.]+)\)/.exec(locations[location]?.Geometry?.WGS84);
	return match ? parseFloat(match[1]) : 0;
}

export function north(location) {
	const match = /POINT \(([\d\\.]+) ([\d\\.]+)\)/.exec(locations[location]?.Geometry?.WGS84);
	return match ? parseFloat(match[2]) : 0;
}
