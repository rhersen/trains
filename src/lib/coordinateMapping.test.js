import { describe, expect, test } from 'vitest';
import { x, y } from './coordinateMapping';

const hallstavik = 'POINT (700193 6662511)';
const kopparåsen = 'POINT (643704 7594479)';
const strömstad = 'POINT (279823 6539287)';
const trelleborg = 'POINT (383466 6137672)';

describe('coordinateMapping', () => {
	test('west', () => {
		const actual = x(strömstad);
		expect(actual).toBeGreaterThan(0);
		expect(actual).toBeLessThan(60);
	});

	test('east', () => {
		const actual = x(hallstavik);
		expect(actual).toBeGreaterThan(420);
		expect(actual).toBeLessThan(480);
	});

	test('north', () => {
		const actual = y(kopparåsen);
		expect(actual).toBeGreaterThan(-640);
		expect(actual).toBeLessThan(-630);
	});

	test('south', () => {
		const actual = y(trelleborg);
		expect(actual).toBeGreaterThan(637);
		expect(actual).toBeLessThan(640);
	});
});
