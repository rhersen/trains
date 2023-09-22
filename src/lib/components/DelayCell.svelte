<script>
	import formatDelay from '$lib/formatDelay.js';

	export let announcement;
</script>

<td>
	{formatDelay(announcement)}
</td>

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
