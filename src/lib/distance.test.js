import { describe, expect, it } from 'vitest';
import distance from './distance';

describe('distance', () => {
	it('works', () => {
		expect(distance('POINT (658267 6564870)', 'POINT (658646 6564971)')).toBeCloseTo(392.23);
	});
});
