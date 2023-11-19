<script>
	import _ from 'lodash';
	import { onDestroy, onMount } from 'svelte';
	import * as sheetCell from '$lib/sheetCell.js';

	export let data;
	let trains = _.pickBy(
		_.groupBy(data.TrainAnnouncement, 'AdvertisedTrainIdent'),
		(announcements) =>
			announcements.some(({ TimeAtLocationWithSeconds }) => !TimeAtLocationWithSeconds) &&
			announcements.some(({ TimeAtLocationWithSeconds }) => !!TimeAtLocationWithSeconds)
	);

	let eventSource;

	onMount(() => {
		if (!data.sseUrl) return;

		eventSource = new EventSource(data.sseUrl);
		eventSource.onmessage = ({ data: s }) => {
			const { RESPONSE } = JSON.parse(s);
			const [{ TrainAnnouncement }] = RESPONSE.RESULT;
			data.TrainAnnouncement = [...TrainAnnouncement, ...data.TrainAnnouncement];
		};
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
	});
</script>

<h1>{Object.keys(trains).length} tåg</h1>

<table>
	<tr>
		<td>s\t</td>
		{#each Object.keys(trains) as key}
			<th>{key}</th>
		{/each}
	</tr>
	{#each data.stations as station}
		<tr>
			<th>{station}</th>
			{#each Object.values(trains) as announcements}
				<td
					style="background-color: {sheetCell.color(
						announcements.filter(({ LocationSignature }) => LocationSignature === station)
					)}"
				>
					{sheetCell.text(
						announcements.filter(({ LocationSignature }) => LocationSignature === station)
					)}
				</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	table {
		border-collapse: collapse;
	}

	th,
	td {
		font-family: sans-serif;
		border-style: solid;
		border-width: 1px;
	}
</style>
