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

	let stations =
		'Öte,Dån,Rön,Gau,Södy,Tu,Uts,Tul,Flb,Hu,Sta,Äs,Åbe,Sst,Sci,Sod,Tmö,So,Udl,Hel,Sol,Hgv,Nvk,R,Upv,Skby'
			.split(',')
			.toReversed();
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

	function td(announcements, station) {
		const found = announcements.find((announcement) => announcement.LocationSignature === station);
		if (!found) return '';
		if (found.TimeAtLocationWithSeconds) return found.TimeAtLocationWithSeconds.substring(11, 19);
		return found.AdvertisedTimeAtLocation.substring(11, 16);
	}
</script>

<table>
	<tr>
		<td>s\t</td>
		{#each Object.keys(trains) as key}
			<th>{key}</th>
		{/each}
	</tr>
	{#each stations as station}
		<tr>
			<th>{station}</th>
			{#each Object.values(trains) as announcements}
				<td>{td(announcements, station)}</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
</style>
