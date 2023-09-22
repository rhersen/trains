<script>
	export let announcement;
</script>

<td>
	<a href="/countdown/train/{announcement.AdvertisedTrainIdent}">
		{announcement.AdvertisedTrainIdent}
	</a>
</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: left;
		padding: 0 2px;
		color: blue;
		text-decoration: underline;
	}

	@media (max-width: 520px) {
		td {
			display: none;
		}
	}
</style>
