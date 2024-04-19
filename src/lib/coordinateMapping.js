const scale = 2290;

export function x(s) {
	return (s.match(/[\d.]+ /)[0] - 120000) / scale;
}

export function y(s) {
	return (7600000 - s.match(/ [\d.]+/)[0]) / scale;
}
