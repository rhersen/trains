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
		positionSource.onmessage = ({ data }) => handlePosition(JSON.parse(data));

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
		return station[station.length - 1]?.LocationSignature;
	}

	function latestPosition(events) {
		const station = events.filter((event) => event.Position);
		return station[station.length - 1];
	}

	function handlePosition(events) {
		events.RESPONSE.RESULT[0].TrainPosition.forEach((item) => {
			console.log(item);
		});
		if (
			events.RESPONSE.RESULT[0].TrainPosition.length === 1 &&
			data.events.at(-1).Position?.SWEREF99TM ===
				events.RESPONSE.RESULT[0].TrainPosition.at(-1).Position.SWEREF99TM
		)
			console.log('duplicate', events.RESPONSE.RESULT[0].TrainPosition.at(-1).Position.SWEREF99TM);
		else data.events = [...data.events, ...events.RESPONSE.RESULT[0].TrainPosition];
	}

	$: near = Object.entries(locations)
		.map(([signature, location]) => ({ ...location, signature }))
		.filter((location) => {
			return distance(location.sweref99tm, latestPosition(data.events).Position.SWEREF99TM) < 9000;
		})
		.toSorted((a, b) => {
			return (
				distance(a.sweref99tm, latestPosition(data.events).Position.SWEREF99TM) -
				distance(b.sweref99tm, latestPosition(data.events).Position.SWEREF99TM)
			);
		});
</script>

<h1>{data.id}</h1>

<hr />
mellan
{locations[latestStation(data.events)]?.name}
och
{latestStation(data.events) === near[0].signature ? near[1].name : near[0].name}
<hr />

senaste position
{latestPosition(data.events).Position.SWEREF99TM}
{#each near as location}
	<div>
		{distance(location.sweref99tm, latestPosition(data.events).Position.SWEREF99TM)}
		meter från
		{location.name ?? location.signature}
	</div>
{/each}

<hr />

{#each data.events.toReversed() as event}
	{#if event.ActivityType}
		<div>
			{event.TimeAtLocationWithSeconds.substring(11, 19)}
			{event.ActivityType}
			{locations[event.LocationSignature].name}
			{locations[event.LocationSignature].sweref99tm}
		</div>
	{:else if event.Position}
		<div>
			{event.TimeStamp.substring(11, 19)}
			{event.Position.SWEREF99TM}
			{#if event.Speed}{event.Speed} km/h{/if}
		</div>
	{/if}
{/each}
