<script type="ts">

	export let data;

	function hhmm(time) {
		return time?.substring(11, 16);
	}

	function names(a) {
		return a?.map(({ LocationName }) => LocationName)?.map(name);
	}

	function name(signature) {
		return data.locations[signature]?.AdvertisedShortLocationName ?? signature;
	}

	function description([{ Description }]) {
		return Description.startsWith('SL ') ? Description.substring(3) : Description;
	}
</script>

<h1>{data.announcements.length} inställda tåg</h1>
{#each data.announcements as { AdvertisedTimeAtLocation,AdvertisedTrainIdent, FromLocation, LocationSignature, ProductInformation, ToLocation }}
	<div>
		{description(ProductInformation)}
		{AdvertisedTrainIdent}
		{names(FromLocation)}-{names(ToLocation)}
		{hhmm(AdvertisedTimeAtLocation)} från {name(LocationSignature)}
		är inställt
	</div>
{/each}

<style>
	h1,
	div {
		font-family: sans-serif;
	}
</style>
