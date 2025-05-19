<script>
	import locations from '$lib/short.json';
	import Row from './Row.svelte';
	import { onDestroy, onMount } from 'svelte';
	import * as announcements from '$lib/announcements.js';

	export let data;
	let eventSource;
	let headerData = data.announcements.find((announcement) => announcement.ToLocation) ?? {};

	function update(announcementArray, updates) {
		return announcements
			.filter([...announcementArray.filter(notUpdated), ...updates])
			.sort(
				(
					{ AdvertisedTimeAtLocation: t1, ActivityType: a1 },
					{ AdvertisedTimeAtLocation: t2, ActivityType: a2 }
				) => {
					if (t1 < t2) return -1;
					if (t1 > t2) return 1;
					if (a1 < a2) return -1;
					if (a1 > a2) return 1;
					return 0;
				}
			);

		function notUpdated({ ActivityType, LocationSignature }) {
			return !updates.some(
				(update) =>
					update.LocationSignature === LocationSignature && update.ActivityType === ActivityType
			);
		}
	}

	onMount(() => {
		if (!data?.sseUrl) return;

		eventSource = new EventSource(data.sseUrl);
		eventSource.onmessage = ({ data: s }) => {
			const { RESPONSE } = JSON.parse(s);
			const [{ TrainAnnouncement }] = RESPONSE.RESULT;
			data.announcements = update(data.announcements, TrainAnnouncement);
		};
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
	});
</script>

<table>
	<caption>
		<div>
			{headerData.ProductInformation?.map(({ Description }) => Description).join(' ')}
			{headerData.AdvertisedTrainIdent}
			från
			{headerData.FromLocation?.map(({ LocationName }) => locations[LocationName]).join(' ')}
			till
			{headerData.ToLocation?.map(({ LocationName }) => locations[LocationName]).join(' ')}
		</div>
		{#if headerData.ViaToLocation}
			<div>
				via
				{headerData.ViaToLocation?.map(({ LocationName }) => locations[LocationName]).join(', ')}
			</div>
		{/if}
		<a href="https://leaflet-hersen.netlify.app/recent/{headerData.AdvertisedTrainIdent}"
			>visa på karta</a
		>
	</caption>
	<tbody>
		{#each data.announcements as announcement}
			<Row {announcement} />
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
	}

	caption {
		font-family: Palatino, serif;
		font-weight: bold;
		margin-top: 0.83em;
	}

	caption div:nth-child(1) {
		font-size: 1.5em;
	}

	caption div:nth-child(2) {
		font-size: 1.2em;
	}
</style>
