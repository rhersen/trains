<script>
	import locations from '$lib/short.json';
	import _ from 'lodash';
	import { onDestroy, onMount } from 'svelte';
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

	function f(location) {
		const found = _.find(data.actual, { LocationSignature: location });
		if (!found) return '';
		const time = found.TimeAtLocationWithSeconds;
		if (time) return time.substring(11, 19);
		return 'stannar';
	}
</script>

<h1>{data.id}</h1>

{#each data.advertised as { AdvertisedTimeAtLocation, LocationSignature }}
	<tr>
		<td>{AdvertisedTimeAtLocation.substring(11, 16)}</td>
		<td>{f(LocationSignature)}</td>
		<td>{locations[LocationSignature]}</td>
	</tr>
{/each}

<style>
	h1,
	td {
		font-family: sans-serif;
	}
</style>
