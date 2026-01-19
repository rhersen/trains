<script>
	import locations from '$lib/short.json';

	export let announcement;
</script>

<td class={announcement.ActivityType}>
	<a href="/countdown/station/{announcement.LocationSignature}">
		{announcement.ActivityType == 'Ankomst' ? 'ank' : ''}
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

	td.Ankomst {
		font-style: italic;
	}

	@media (max-width: 370px) {
		td {
			display: none;
		}
	}
</style>
