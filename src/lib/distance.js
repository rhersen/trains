export default function distance(s1, s2) {
	const coord = /(\d+) (\d+)/;
	const [, x1, y1] = coord.exec(s1);
	const [, x2, y2] = coord.exec(s2);
	return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}
