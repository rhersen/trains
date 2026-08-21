import { describe, expect, it } from 'vitest';
import { filter, forServiceDate } from '$lib/announcements.js';

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

describe('announcements forServiceDate', () => {
	it('uses current-day announcements and adds missing locations from an earlier service day', () => {
		const result = forServiceDate(
			[
				{
					ActivityType: 'Avgang',
					LocationSignature: 'DAN',
					AdvertisedTimeAtLocation: '2026-08-19T08:14:00',
					ScheduledDepartureDateTime: '2026-08-19T07:00:00'
				},
				{
					ActivityType: 'Avgang',
					LocationSignature: 'DAN',
					AdvertisedTimeAtLocation: '2026-08-20T08:15:00',
					ScheduledDepartureDateTime: '2026-08-20T07:00:00',
					TimeAtLocation: '2026-08-20T08:16:00',
					TimeAtLocationWithSeconds: '2026-08-20T08:16:12',
					EstimatedTimeAtLocation: '2026-08-20T08:17:00',
					Deviation: [{ Description: 'Old disruption' }]
				},
				{
					ActivityType: 'Avgang',
					LocationSignature: 'GAU',
					AdvertisedTimeAtLocation: '2026-08-21T08:30:00',
					ScheduledDepartureDateTime: '2026-08-21T07:00:00',
					TimeAtLocation: '2026-08-21T08:31:00'
				}
			],
			'2026-08-21'
		);

		expect(result).toHaveLength(2);
		expect(result.map(({ LocationSignature }) => LocationSignature)).toEqual(['DAN', 'GAU']);
		expect(result[0]).toMatchObject({
			AdvertisedTimeAtLocation: '2026-08-21T08:15:00',
			ScheduledDepartureDateTime: '2026-08-21T07:00:00'
		});
		expect(result[0]).not.toHaveProperty('TimeAtLocation');
		expect(result[0]).not.toHaveProperty('TimeAtLocationWithSeconds');
		expect(result[0]).not.toHaveProperty('EstimatedTimeAtLocation');
		expect(result[0]).not.toHaveProperty('Deviation');
		expect(result[1].TimeAtLocation).toBe('2026-08-21T08:31:00');
	});

	it('does not add a fallback when the location exists on the requested date', () => {
		const result = forServiceDate(
			[
				{
					ActivityType: 'Avgang',
					LocationSignature: 'DAN',
					AdvertisedTimeAtLocation: '2026-08-20T08:15:00',
					ScheduledDepartureDateTime: '2026-08-20T07:00:00'
				},
				{
					ActivityType: 'Avgang',
					LocationSignature: 'DAN',
					AdvertisedTimeAtLocation: '2026-08-21T08:16:00',
					ScheduledDepartureDateTime: '2026-08-21T07:00:00'
				}
			],
			'2026-08-21'
		);

		expect(result).toEqual([
			expect.objectContaining({
				LocationSignature: 'DAN',
				AdvertisedTimeAtLocation: '2026-08-21T08:16:00'
			})
		]);
	});
});
