<script>
	import locations from '$lib/short.json';
	import Row from './Row.svelte';
	import { onDestroy, onMount } from 'svelte';

	export let data;
	let eventSource;

	function update(announcements, updates) {
		const a = [...announcements];

		for (const update of updates) {
			const i = data.announcements.findIndex(sameId(update));
			if (i >= 0) a[i] = update;
		}

		return a;

		function sameId(a1) {
			return (a2) => a1.AdvertisedTrainIdent === a2.AdvertisedTrainIdent;
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
		{locations[data.location]}
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
		font-size: 1.5em;
		font-weight: bold;
		margin-top: 0.83em;
	}
</style>
