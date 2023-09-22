<script>
	import { format, parseISO } from 'date-fns';

	export let announcement;

	function hmm(advertised) {
		const parsed = parseISO(advertised);
		return format(parsed, parsed.getSeconds() ? 'H:mm:ss' : 'H:mm');
	}
</script>

<td>
	{#if announcement.TimeAtLocation}
		<b>{hmm(announcement.TimeAtLocationWithSeconds)}</b>
	{:else if announcement.EstimatedTimeAtLocation}
		<i>{hmm(announcement.EstimatedTimeAtLocation)}</i>
	{:else}
		{hmm(announcement.AdvertisedTimeAtLocation)}
	{/if}
</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: right;
		padding: 0 2px;
	}
</style>
