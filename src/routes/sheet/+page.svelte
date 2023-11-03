<script>
	import _ from 'lodash';
	import { onDestroy, onMount } from 'svelte';

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

<ul>
	{#each Object.entries(trains) as [id, announcements]}
		<li>
			{id}
			<ul>
				{#each announcements as announcement}
					<li>
						{announcement.ProductInformation.map(({ Description }) => Description)}
						{announcement.AdvertisedTrainIdent}
						{announcement.ToLocation.map(({ LocationName }) => LocationName)}
						{announcement.ActivityType}
						{announcement.LocationSignature}
						{announcement.AdvertisedTimeAtLocation.substring(11, 16)}
						{announcement.TimeAtLocationWithSeconds}
					</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>

<style>
</style>
