<script>
	import locations from '$lib/short.json';
	export let data;
	let f = ({ LocationName }) => locations[LocationName];
</script>

{#each data.announcements as a}
	<div>
		<a href={`${a.ProductInformation[0].Code}/${a.AdvertisedTrainIdent}`}>
			{a.AdvertisedTrainIdent}
		</a>
		från {a.FromLocation.map(f)}
		till {a.ToLocation.map(f)}
		{a.ActivityType?.toLowerCase().substring(0, 3)}
		{locations[a.LocationSignature]}
	</div>
{/each}
