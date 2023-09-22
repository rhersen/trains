<script>
	import { format, parseISO } from 'date-fns';

	export let announcement;

	function time(announcement) {
		return hmm(announcement.AdvertisedTimeAtLocation);

		function hmm(advertised) {
			const parsed = parseISO(advertised);
			return format(parsed, parsed.getSeconds() ? 'H:mm:ss' : 'H:mm');
		}
	}
</script>

<td>{time(announcement)}</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: right;
		padding: 0 2px;
	}

	@media (max-width: 580px) {
		td {
			display: none;
		}
	}
</style>
