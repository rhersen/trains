import { describe, expect, test } from 'vitest';
import { x, y } from './coordinateMapping';

const haparanda = 'POINT (916041 7331082)';
const kopparåsen = 'POINT (643704 7594479)';
const strömstad = 'POINT (279823 6539287)';
const trelleborg = 'POINT (383466 6137672)';

describe('coordinateMapping', () => {
	test('west', () => {
		const actual = x(strömstad);
		expect(actual).toBeGreaterThan(0);
		expect(actual).toBeLessThan(74);
	});

	test('east', () => {
		const actual = x(haparanda);
		expect(actual).toBeGreaterThan(335);
		expect(actual).toBeLessThan(360);
	});

	test('north', () => {
		const actual = y(kopparåsen);
		expect(actual).toBeGreaterThan(0);
		expect(actual).toBeLessThan(3);
	});

	test('south', () => {
		const actual = y(trelleborg);
		expect(actual).toBeGreaterThan(637);
		expect(actual).toBeLessThan(640);
	});
});
