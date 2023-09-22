<script>
	export let announcement;

	function descriptions(deviation) {
		return deviation.Description;
	}

	function shortText(announcement) {
		const deviations = (announcement.Deviation || []).map(descriptions);

		return deviations
			? deviations
					.map((s) => {
						if (/Kort/.test(s)) return 'K';
						if (s.length) return '*';
						return s;
					})
					.join()
			: '';
	}
</script>

<td>{shortText(announcement)}</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: left;
		padding: 0 2px;
	}
</style>
