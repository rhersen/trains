import { describe, expect, test } from 'vitest';
import { color, text } from '$lib/sheetCell.js';

describe('sheetCell', () => {
	describe('text', () => {
		test('empty', () => {
			expect(text([])).toBe('');
			expect(color([])).toBe('black');
		});

		test('advertised avgang and ankomst with same time', () => {
			const announcements = [
				{
					ActivityType: 'Ankomst',
					AdvertisedTimeAtLocation: '2222-11-11T17:08:00'
				},
				{
					ActivityType: 'Avgang',
					AdvertisedTimeAtLocation: '2222-11-11T17:08:00'
				}
			];
			expect(text(announcements)).toBe('17:08');
			expect(color(announcements)).toBe('gray');
		});

		test('advertised avgang and ankomst with different times', () => {
			const announcements = [
				{
					ActivityType: 'Ankomst',
					AdvertisedTimeAtLocation: '2222-11-11T17:07:00'
				},
				{
					ActivityType: 'Avgang',
					AdvertisedTimeAtLocation: '2222-11-11T17:08:00'
				}
			];
			expect(text(announcements)).toBe('17:07/08');
			expect(color(announcements)).toBe('gray');
		});

		test('actual avgang and ankomst', () => {
			const announcements = [
				{
					ActivityType: 'Ankomst',
					AdvertisedTimeAtLocation: '2222-11-11T15:52:00',
					TimeAtLocationWithSeconds: '2222-11-11T15:52:51'
				},
				{
					ActivityType: 'Avgang',
					AdvertisedTimeAtLocation: '2222-11-11T15:53:00',
					TimeAtLocationWithSeconds: '2222-11-11T15:54:04'
				}
			];
			expect(text(announcements)).toBe('15:54:04');
			expect(color(announcements)).toBe('green');
		});

		test('ankomst without avgang', () => {
			const announcements = [
				{
					ActivityType: 'Avgang',
					AdvertisedTimeAtLocation: '2222-11-11T16:51:00'
				},
				{
					ActivityType: 'Ankomst',
					AdvertisedTimeAtLocation: '2222-11-11T16:51:00',
					TimeAtLocationWithSeconds: '2222-11-11T16:50:01'
				}
			];
			expect(text(announcements)).toBe('Avg16:51 16:50:01');
			expect(color(announcements)).toBe('orange');
		});

		test('no ankomst', () => {
			const announcements = [
				{
					ActivityType: 'Avgang',
					AdvertisedTimeAtLocation: '2222-11-11T16:46:00',
					TimeAtLocationWithSeconds: '2222-11-11T16:46:23'
				}
			];
			expect(text(announcements)).toBe('16:46:23');
			expect(color(announcements)).toBe('lightgreen');
		});

		test('no avgang', () => {
			const announcements = [
				{
					ActivityType: 'Ankomst',
					AdvertisedTimeAtLocation: '2222-11-11T16:46:00'
				}
			];
			expect(text(announcements)).toBe('Ank16:46');
			expect(color(announcements)).toBe('yellow');
		});
	});
});
