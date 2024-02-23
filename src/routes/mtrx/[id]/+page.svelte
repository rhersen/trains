<script>
	import locations from '$lib/short.json';
	export let data;

	function f(location) {
		const found = data.actual[location];
		if (!found) return '-';
		const time = found.TimeAtLocationWithSeconds;
		if (time) return time.substring(11, 19);
		return '–';
	}
</script>

<h1>{data.id}</h1>

{#each data.advertised as { AdvertisedTimeAtLocation, LocationSignature }}
	<div>
		<span>{AdvertisedTimeAtLocation.substring(11, 16)}</span>
		<span>{f(LocationSignature)}</span>
		<span>{locations[LocationSignature]}</span>
	</div>
{/each}
