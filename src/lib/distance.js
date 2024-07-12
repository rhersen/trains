export default function distance(s1, s2) {
	const coord = /(\d+) (\d+)/;
	const [, x1, y1] = coord.exec(s1);
	const [, x2, y2] = coord.exec(s2);
	const dx = x1 - x2;
	const dy = y1 - y2;
	const x = dx < 0 ? -dx : dx;
	const y = dy < 0 ? -dy : dy;
	return x > y ? x : y;
	// return Math.sqrt(dx ** 2 + dy ** 2);
}
