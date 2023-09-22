<script>
	import slices from '$lib/slices.js';
	import { color } from '$lib/delay.js';

	export let data;
</script>

<h1>Tullinge, norrgående</h1>

{#each Object.entries(slices(data)) as [hour, announcements]}
	<div>
		<span class="hour">{hour.substring(11)}</span>
		{#each announcements as announcement}
			<span style="background-color: {color(announcement)}">
				{announcement.AdvertisedTimeAtLocation.substring(14, 16) + ' '}
			</span>
		{/each}
	</div>
{/each}

<style>
	div,
	h1 {
		font-family: sans-serif;
	}

	.hour {
		font-weight: bold;
	}
</style>
