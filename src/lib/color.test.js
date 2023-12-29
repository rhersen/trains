import { describe, expect, it } from 'vitest';
import { delay } from '$lib/color.js';

describe('Color function', () => {
	it('returns lime when delay is less than 30 seconds', () => {
		const input = {
			TimeAtLocationWithSeconds: '2023-12-29T13:22:21.000+01:00',
			AdvertisedTimeAtLocation: '2023-12-29T13:22:00.000+01:00'
		};
		expect(delay(input)).to.equal('delay-0');
	});

	it('returns white when delay is between 30 and 120 seconds', () => {
		const input = {
			TimeAtLocationWithSeconds: '2023-12-29T13:20:53.000+01:00',
			AdvertisedTimeAtLocation: '2023-12-29T13:20:00.000+01:00'
		};
		expect(delay(input)).to.equal('delay-1-min');
	});

	it('returns yellow when delay is between 120 and 240 seconds', () => {
		const input = {
			TimeAtLocationWithSeconds: '2023-12-29T13:23:01.000+01:00',
			AdvertisedTimeAtLocation: '2023-12-29T13:20:00.000+01:00'
		};
		expect(delay(input)).to.equal('delay-3-min');
	});

	it('returns darkorange when delay is between 240 and 480 seconds', () => {
		const input = {
			TimeAtLocationWithSeconds: '2023-12-29T13:21:50.000+01:00',
			AdvertisedTimeAtLocation: '2023-12-29T13:16:00.000+01:00'
		};
		expect(delay(input)).to.equal('delay-5-min');
	});

	it('returns orangered when delay is between 480 and 800 seconds', () => {
		const input = {
			TimeAtLocationWithSeconds: '2023-12-29T13:21:05.000+01:00',
			AdvertisedTimeAtLocation: '2023-12-29T13:08:00.000+01:00'
		};
		expect(delay(input)).to.equal('delay-10-min');
	});

	it('returns red when delay is more than 800 seconds', () => {
		const input = {
			TimeAtLocationWithSeconds: '2023-12-29T13:14:18.000+01:00',
			AdvertisedTimeAtLocation: '2023-12-29T13:00:00.000+01:00'
		};
		expect(delay(input)).to.equal('delay-15-min');
	});
});
