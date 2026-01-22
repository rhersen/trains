<script>
	import locations from '$lib/short.json';
	export let announcement;

	const departureDate = (dt) => (typeof dt === 'string' ? dt.slice(0, 10) : dt);
	const loc = (array) => array.map((location) => locations[location.LocationName]).join();
</script>

<td>
	<span class="from">{loc(announcement.FromLocation)}–</span><a
		href="/countdown/train/{announcement.AdvertisedTrainIdent}/{departureDate(
			announcement.ScheduledDepartureDateTime
		)}">{loc(announcement.ToLocation)}</a
	>
</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: left;
		padding: 0 2px;
	}

	.from {
		font-size: smaller;
	}

	@media (min-width: 520px) {
		a {
			color: black;
			text-decoration: none;
		}
	}

	@media (max-width: 711px) {
		.from {
			display: none;
		}
	}
</style>
