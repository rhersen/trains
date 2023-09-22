<script>
	import locations from '$lib/short.json';

	export let announcement;
</script>

<td>
	<a href="/countdown/station/{announcement.LocationSignature}">
		{locations[announcement.LocationSignature]}
	</a>
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
