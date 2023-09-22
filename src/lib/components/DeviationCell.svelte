<script>
	export let announcement;

	function descriptions(deviation) {
		return deviation.Description;
	}

	function deviationText() {
		return (announcement.Deviation || []).map(descriptions).filter((s) => !/Kort/.test(s));
	}
</script>

<td>
	{#each deviationText(announcement) as c}
		<div>{c}</div>
	{/each}
</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: left;
		padding: 0 2px;
	}

	@media (max-width: 640px) {
		td {
			display: none;
		}
	}
</style>
