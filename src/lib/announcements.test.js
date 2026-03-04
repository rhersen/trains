import { describe, expect, it } from 'vitest';
import { filter } from '$lib/announcements.js';

describe('announcements filter', () => {
	it('removes Ankomst when duplicate LocationSignature + AdvertisedTimeAtLocation exists', () => {
		const announcements = [
			{
				ActivityType: 'Ankomst',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00'
			},
			{
				ActivityType: 'Avgang',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00'
			}
		];

		const result = filter(announcements);

		expect(result).toHaveLength(1);
		expect(result[0].ActivityType).toBe('Avgang');
	});

	it('keeps Ankomst when there is no duplicate for the same location/time', () => {
		const announcements = [
			{
				ActivityType: 'Ankomst',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00'
			},
			{
				ActivityType: 'Avgang',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:09:00'
			}
		];

		const result = filter(announcements);

		expect(result).toHaveLength(2);
	});

	it('keeps Ankomst when its matching Avgang lacks TimeAtLocationWithSeconds', () => {
		const announcements = [
			{
				ActivityType: 'Ankomst',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00',
				TimeAtLocationWithSeconds: '2222-11-11T17:08:12'
			},
			{
				ActivityType: 'Avgang',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00'
			}
		];

		const result = filter(announcements);

		expect(result).toHaveLength(2);
		expect(result.map((a) => a.ActivityType)).toEqual(['Ankomst', 'Avgang']);
	});

	it('removes Ankomst when both Ankomst and Avgang have TimeAtLocationWithSeconds', () => {
		const announcements = [
			{
				ActivityType: 'Ankomst',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00',
				TimeAtLocationWithSeconds: '2222-11-11T17:08:12'
			},
			{
				ActivityType: 'Avgang',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00',
				TimeAtLocationWithSeconds: '2222-11-11T17:08:45'
			}
		];

		const result = filter(announcements);

		expect(result).toHaveLength(1);
		expect(result[0].ActivityType).toBe('Avgang');
	});

	it('removes Ankomst when both Ankomst and Avgang have TimeAtLocationWithSeconds', () => {
		const announcements = [
			{
				ActivityType: 'Ankomst',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:07:00',
				TimeAtLocationWithSeconds: '2222-11-11T17:08:12'
			},
			{
				ActivityType: 'Avgang',
				LocationSignature: 'Abc',
				AdvertisedTimeAtLocation: '2222-11-11T17:08:00',
				TimeAtLocationWithSeconds: '2222-11-11T17:08:45'
			}
		];

		const result = filter(announcements);

		expect(result).toHaveLength(2);
		expect(result.map((a) => a.ActivityType)).toEqual(['Ankomst', 'Avgang']);
	});
});
