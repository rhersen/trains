<script>
	import { line1, line2 } from '$lib/formatLatestAnnouncement';
	import getColor from '$lib/color';

	export let trains;
	export let div;
</script>

<div class="branch div{div}">
	{#each trains as train}
		<div class="train">
			<div style="color: {getColor(train.latestDeparture || train.latest)}">
				{line1(train.latest)}
			</div>
			<div style="color: {getColor(train.latestDeparture || train.latest)}">
				{line2(train.latest)}
			</div>
		</div>
	{/each}
</div>

<!--suppress CssUnusedSymbol -->
<style>
	.branch {
		font-family: 'PT Sans Narrow', 'Arial Narrow', Arial, sans-serif;
		font-size: 14px;
		background: #222222;
		border: 0.3px solid lightcyan;
		white-space: nowrap;
	}

	.div1 {
		grid-area: 1 / 1 / 2 / 3;
	}
	.div2 {
		grid-area: 1 / 3 / 2 / 5;
	}
	.div3 {
		grid-area: 2 / 2 / 3 / 4;
	}
	.div4 {
		grid-area: 3 / 1 / 4 / 3;
	}
	.div5 {
		grid-area: 3 / 3 / 4 / 5;
	}
</style>
