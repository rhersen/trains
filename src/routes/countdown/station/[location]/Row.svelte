<script>
	import TrainIdCell from './TrainIdCell.svelte';
	import AdvertisedTimeCell from '$lib/components/AdvertisedTimeCell.svelte';
	import DestinationCell from './DestinationCell.svelte';
	import TrackCell from '$lib/components/TrackCell.svelte';
	import ShortCell from '$lib/components/ShortCell.svelte';
	import TimeCell from '$lib/components/TimeCell.svelte';
	import DelayCell from '$lib/components/DelayCell.svelte';
	import DeviationCell from '$lib/components/DeviationCell.svelte';
	import CountdownCell from '$lib/components/CountdownCell.svelte';
	import ProductCell from './ProductCell.svelte';

	export let announcement;

	function directionClass(announcement) {
		return /\d+[24680]$/.test(announcement.AdvertisedTrainIdent) ? 'northbound' : 'southbound';
	}
</script>

<tr class={directionClass(announcement)}>
	<ProductCell {announcement} />
	<TrainIdCell {announcement} />
	<TrackCell {announcement} />
	<ShortCell {announcement} />
	<DestinationCell {announcement} />
	<AdvertisedTimeCell {announcement} />
	<TimeCell {announcement} />
	<DelayCell {announcement} />
	<CountdownCell {announcement} />
	<DeviationCell {announcement} />
</tr>

<!--suppress CssUnusedSymbol -->
<style>
	tr.northbound {
		background-color: #fdd;
	}

	tr.southbound {
		background-color: lightblue;
	}
</style>
