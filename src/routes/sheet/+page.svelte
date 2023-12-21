<script>
	import _ from 'lodash';
	import { onDestroy, onMount } from 'svelte';
	import * as sheetCell from '$lib/sheetCell.js';

	export let data;
	let trains = _.filter(
		_.sortBy(
			_.values(
				_.pickBy(
					_.groupBy(data.TrainAnnouncement, 'AdvertisedTrainIdent'),
					(announcements) =>
						announcements.some(({ TimeAtLocationWithSeconds }) => !TimeAtLocationWithSeconds) &&
						announcements.some(({ TimeAtLocationWithSeconds }) => !!TimeAtLocationWithSeconds) &&
						announcements.some(({ LocationSignature }) => LocationSignature === 'Sci')
				)
			),
			(a) => _.find(a, { LocationSignature: 'Sci' })?.AdvertisedTimeAtLocation
		),
		(train) => train.length > 12
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

<table>
	<tr>
		<td />
		{#each trains as [train]}
			<th>
				{train.AdvertisedTrainIdent}
				{train.ToLocation[0].LocationName}
			</th>
		{/each}
	</tr>
	{#each data.stations as station}
		<tr>
			<th>{station}</th>
			{#each trains as announcements}
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
