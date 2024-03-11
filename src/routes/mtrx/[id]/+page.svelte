<script>
	import _ from 'lodash';
	import { differenceInSeconds, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import locations from '$lib/short.json';
	export let data;
	let eventSource;

	function update(announcements, updates) {
		return [...announcements, ...updates];
	}

	onMount(() => {
		console.log(data?.sseUrl);
		if (!data?.sseUrl) return;

		eventSource = new EventSource(data.sseUrl);
		eventSource.onmessage = ({ data: s }) => {
			const { RESPONSE } = JSON.parse(s);
			const [{ TrainAnnouncement }] = RESPONSE.RESULT;
			console.log(TrainAnnouncement.map(({ LocationSignature }) => LocationSignature));
			data.actual = update(data.actual, TrainAnnouncement);
		};
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
	});

	function actual(location) {
		const found = _.find(data.actual, { LocationSignature: location });
		if (!found) return '';
		const time = found.TimeAtLocationWithSeconds;
		if (time) return time.substring(11, 19);
		return 'stannar';
	}

	function getCountdown() {
		return Date.now() - 24 * 60 * 60 * 1000;
	}

	function advertisedDiff(time, now, location) {
		const found = _.find(data.actual, { LocationSignature: location });
		if (found) return '';
		const number = differenceInSeconds(parseISO(time), now);
		if (number < 1000) return number;
		return '';
	}

	function actualDiff(location) {
		const found = _.find(data.actual, { LocationSignature: location });
		if (!found?.AdvertisedTimeAtLocation) return '';
		if (found.TimeAtLocationWithSeconds) {
			return differenceInSeconds(
				parseISO(found.AdvertisedTimeAtLocation),
				parseISO(found.TimeAtLocationWithSeconds)
			);
		}
		return '';
	}

	let countdown = getCountdown();
	const interval = setInterval(() => (countdown = getCountdown()), 1000);
	onDestroy(() => clearInterval(interval));
</script>

<h1>{data.id}</h1>

{#each data.advertised as { AdvertisedTimeAtLocation, LocationSignature }}
	<tr>
		<td>{locations[LocationSignature]}</td>
		<td>{AdvertisedTimeAtLocation.substring(11, 16)}</td>
		<td>{advertisedDiff(AdvertisedTimeAtLocation, countdown, LocationSignature)}</td>
		<td>{actual(LocationSignature)}</td>
		<td>{actualDiff(LocationSignature)}</td>
	</tr>
{/each}

<style>
	h1,
	td {
		font-family: sans-serif;
		text-align: right;
	}
</style>
