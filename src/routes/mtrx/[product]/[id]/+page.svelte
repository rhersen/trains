<script>
	import { onDestroy, onMount } from 'svelte';
	import distance from '$lib/distance';
	import locations from '$lib/sweref99tm.json';

	export let data;
	let positionSource;
	let announcementSource;

	onMount(() => {
		if (!data?.sseAnnouncements) return;
		if (!data?.ssePositions) return;

		positionSource = new EventSource(data.ssePositions);
		positionSource.onmessage = ({ data: s }) => {
			const events = JSON.parse(s);
			events.RESPONSE.RESULT[0].TrainPosition.forEach((item) => {
				console.log(item);
			});
			if (
				events.RESPONSE.RESULT[0].TrainPosition.length === 1 &&
				data.events.at(-1).Position?.SWEREF99TM ===
					events.RESPONSE.RESULT[0].TrainPosition.at(-1).Position.SWEREF99TM
			)
				console.log(
					'duplicate',
					events.RESPONSE.RESULT[0].TrainPosition.at(-1).Position.SWEREF99TM
				);
			else data.events = [...data.events, ...events.RESPONSE.RESULT[0].TrainPosition];
		};

		announcementSource = new EventSource(data.sseAnnouncements);
		announcementSource.onmessage = ({ data: s }) => {
			const events = JSON.parse(s);
			events.RESPONSE.RESULT[0].TrainAnnouncement.forEach((item) => {
				console.log(item);
			});
			data.events = [...data.events, ...events.RESPONSE.RESULT[0].TrainAnnouncement];
		};
	});

	onDestroy(() => {
		if (positionSource) positionSource.close();
		if (announcementSource) announcementSource.close();
	});

	function latestStation(events) {
		const station = events.filter((event) => event.ActivityType);
		return station[station.length - 1].LocationSignature;
	}

	function latestPosition(events) {
		const station = events.filter((event) => event.Position);
		return station[station.length - 1];
	}

	$: latestStationCoordinates = locations[latestStation(data.events)].sweref99tm;

	$: near = () =>
		Object.entries(locations).filter(([, location]) => {
			return distance(location.sweref99tm, latestPosition(data.events).Position.SWEREF99TM) < 2500;
		});
</script>

<h1>{data.id}</h1>

senaste station
{latestStation(data.events)}
{latestStationCoordinates}

<hr />

senaste position
{latestPosition(data.events).Position.SWEREF99TM}
{#each near() as [k, location]}
	<div>
		{distance(location.sweref99tm, latestPosition(data.events).Position.SWEREF99TM)}
		meter från
		{k}
	</div>
{/each}

<hr />

{#each data.events as event}
	{#if event.ActivityType}
		<div>
			{event.TimeAtLocationWithSeconds.substring(11, 19)}
			{event.ActivityType}
			{event.LocationSignature}
			{locations[event.LocationSignature].sweref99tm}
		</div>
	{:else if event.Position}
		<div>
			{event.TimeStamp.substring(11, 19)}
			{event.Position.SWEREF99TM}
		</div>
	{/if}
{/each}
