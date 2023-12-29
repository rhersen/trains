<script>
	import { line, line1, line2 } from '$lib/formatLatestAnnouncement';
	import { delay } from '$lib/color';

	export let trains;
	export let div;
	export let lines;
</script>

<div class="branch div{div}">
	{#each trains as train}
		<div class="train">
			{#if lines === 1}
				<div class={delay(train.latestDeparture || train.latest)}>
					{line(train.latest)}
				</div>
			{/if}
			{#if lines === 2}
				<div class={delay(train.latestDeparture || train.latest)}>
					{line1(train.latest)}
				</div>
				<div class={delay(train.latestDeparture || train.latest)}>
					{line2(train.latest)}
				</div>
			{/if}
		</div>
	{/each}
</div>

<!--suppress CssUnusedSymbol -->
<style>
	.branch {
		font-family: 'Avenir Next Condensed Medium', sans-serif;
		font-size: 14px;
		background: #222222;
		border: 0.3px solid lightcyan;
		white-space: nowrap;
	}

	.delay-0 {
		color: lime;
	}
	.delay-1-min {
		color: white;
	}
	.delay-3-min {
		color: yellow;
	}
	.delay-5-min {
		color: darkorange;
	}
	.delay-10-min {
		color: orangered;
	}
	.delay-15-min {
		color: red;
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
