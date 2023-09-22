<script>
	import { addSeconds, differenceInSeconds, format, parseISO } from 'date-fns';
	import { onDestroy } from 'svelte';

	export let announcement;

	function getCountdown() {
		const dateLeft =
			announcement.TimeAtLocationWithSeconds ||
			announcement.EstimatedTimeAtLocation ||
			announcement.AdvertisedTimeAtLocation;
		const seconds = differenceInSeconds(parseISO(dateLeft), new Date());

		if (seconds <= -100) return '';
		if (seconds >= 600) return `${Math.floor(seconds / 60)}min`;
		if (seconds >= 100) return format(addSeconds(new Date(0), seconds), 'm:ss');
		return `${seconds}s`;
	}

	let countdown = getCountdown();

	const interval = setInterval(() => (countdown = getCountdown()), 1000);
	onDestroy(() => clearInterval(interval));
</script>

<td>{countdown}</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: left;
		padding: 0 2px;
	}

	@media (max-width: 370px) {
		td {
			display: none;
		}
	}
</style>
