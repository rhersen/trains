const scale = 1145;

export function x(s) {
	return (s.match(/[\d.]+ /)[0] - 215000) / scale;
}

export function y(s) {
	return (6870000 - s.match(/ [\d.]+/)[0]) / scale;
}
