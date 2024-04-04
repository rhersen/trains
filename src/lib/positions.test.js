import { describe, expect, it } from 'vitest';
import { concat } from './positions.js';

const old263 = {
	Train: { AdvertisedTrainNumber: '263' },
	Position: { SWEREF99TM: 'POINT (651384 6676423)' },
	TimeStamp: '2024-04-03T08:47:15.000+02:00',
	Bearing: 167,
	Speed: 196
};
const new262 = {
	Train: { AdvertisedTrainNumber: '262' },
	Position: { SWEREF99TM: 'POINT (632765 6706718)' },
	TimeStamp: '2024-04-03T08:47:29.000+02:00',
	Bearing: 23,
	Speed: 194
};
const new263 = {
	Train: { AdvertisedTrainNumber: '263' },
	Position: { SWEREF99TM: 'POINT (651499 6675607)' },
	TimeStamp: '2024-04-03T08:47:30.000+02:00',
	Bearing: 176,
	Speed: 198
};

describe('concat', () => {
	it('handles empty input', () => {
		const positions = concat([], []);
		expect(positions).toEqual([]);
	});

	it('overwrites', () => {
		const positions = concat([old263], [new262, new263]);
		expect(positions).toEqual([new262, new263]);
	});

	it('concatenates', () => {
		const positions = concat([old263], [new262]);
		expect(positions).toEqual([old263, new262]);
	});
});
