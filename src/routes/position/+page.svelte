<script>
	import _ from 'lodash';
	import { differenceInSeconds, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import places from '$lib/sweref99tm.json';
	export let data;

	let eventSource;

	let scale = 1000;
	let location = 'Smn';

	$: x = (s) => {
		const s2 = places[location]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/[\d.]+ /)[0];
		const xOffset = s2.match(/[\d.]+ /)[0] - 240 * scale;
		return sweref / scale - xOffset / scale;
	};

	$: y = (s) => {
		const s2 = places[location]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/ [\d.]+/)[0];
		const yOffset = Number(s2.match(/ [\d.]+/)[0]) + 320 * scale;
		return yOffset / scale - sweref / scale;
	};

	function onClick(place) {
		return () => {
			location = place;
		};
	}

	function points(ps) {
		return ps.map((p) => `${x(p.Position.SWEREF99TM)},${y(p.Position.SWEREF99TM)}`).join(' ');
	}

	onMount(() => {
		if (!data?.sseUrl) return;

		eventSource = new EventSource(data.sseUrl);
		eventSource.onmessage = ({ data: s }) => {
			const updated = { ...data.positions };
			JSON.parse(s).RESPONSE.RESULT[0].TrainPosition.forEach((p) => {
				const key = p.Train.AdvertisedTrainNumber;
				const found = updated[key];
				if (!found) updated[key] = [p];
				else found.unshift(p);
			});

			const filtered = _.mapValues(updated, (value) =>
				_.reject(value, (p) => {
					const seconds = differenceInSeconds(new Date(), parseISO(p.TimeStamp));
					const reject = seconds > 120;
					if (reject) console.log(seconds);
					return reject;
				})
			);
			data.positions = _.omitBy(filtered, _.isEmpty);
		};
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
	});
</script>

<div class="page">
	<div>
		{scale}
		<input type="range" min="100" max="1000" step="100" bind:value={scale} />
	</div>
	<div>
		{places[location]?.name}
	</div>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640">
		<rect x="0" y="0" width="480" height="640" fill="white" />
		{#each Object.keys(places) as place}
			<text
				x={x(places[place].sweref99tm)}
				y={y(places[place].sweref99tm)}
				text-anchor="middle"
				style="fill: gray;"
				on:click={onClick(place)}
				on:keydown={onClick(place)}
				role="button"
				tabindex="0"
			>
				{place}
			</text>
		{/each}
		{#each Object.values(data.positions) as ps}
			<polyline points={points(ps)} stroke="hsl({ps[0].Bearing}, 100%, 27.5%)" fill="none" />
			<circle
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="5"
				fill="black"
			/>
			<circle
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="4"
				fill="hsl({ps[0].Bearing}, 100%, 27.5%)"
			/>
		{/each}
	</svg>
</div>

<style>
	.page {
		background-color: antiquewhite;
	}
	svg {
		font-family: sans-serif;
		font-size: 12px;
	}
	polyline {
		stroke-width: 3;
	}
</style>
