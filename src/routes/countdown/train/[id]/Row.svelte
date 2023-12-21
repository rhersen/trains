<script>
	import { differenceInSeconds, parseISO } from 'date-fns';
	import AdvertisedTimeCell from '$lib/components/AdvertisedTimeCell.svelte';
	import TrackCell from '$lib/components/TrackCell.svelte';
	import ShortCell from '$lib/components/ShortCell.svelte';
	import TimeCell from '$lib/components/TimeCell.svelte';
	import DelayCell from '$lib/components/DelayCell.svelte';
	import DeviationCell from '$lib/components/DeviationCell.svelte';
	import CountdownCell from '$lib/components/CountdownCell.svelte';
	import hue from '$lib/hue.js';
	import LocationCell from './LocationCell.svelte';

	export let announcement;

	$: h = hue(
		announcement?.TimeAtLocationWithSeconds &&
			differenceInSeconds(
				parseISO(announcement.TimeAtLocationWithSeconds),
				parseISO(announcement.AdvertisedTimeAtLocation)
			)
	);
</script>

<tr style="background-color: hsl({h}deg, 100%, 70%)">
	<TrackCell {announcement} />
	<ShortCell {announcement} />
	<LocationCell {announcement} />
	<AdvertisedTimeCell {announcement} />
	<TimeCell {announcement} />
	<DelayCell {announcement} />
	<CountdownCell {announcement} />
	<DeviationCell {announcement} />
</tr>
