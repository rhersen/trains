<script>
	import _ from 'lodash';
	import { differenceInSeconds, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import places from '$lib/sweref99tm.json';
	import { position as fill } from '$lib/color.js';
	export let data;

	let eventSource;

	let trainNumber;
	let trains = {};
	let trainInfo = '';
	let centered = 'Nba';
	let logScale = 6;

	$: scale = 2 ** logScale;

	$: x = (s) => {
		const s2 = places[centered]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/[\d.]+ /)[0];
		const xOffset = s2.match(/[\d.]+ /)[0] - 240 * scale;
		return sweref / scale - xOffset / scale;
	};

	$: y = (s) => {
		const s2 = places[centered]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/ [\d.]+/)[0];
		const yOffset = Number(s2.match(/ [\d.]+/)[0]) + 320 * scale;
		return yOffset / scale - sweref / scale;
	};

	function center(place) {
		return () => {
			centered = place;
		};
	}

	function placeName(location) {
		return places[location.LocationName]
			? places[location.LocationName].name
			: location.LocationName;
	}

	$: if (trainNumber) {
		const train = trains[trainNumber];
		if (train) {
			trainInfo = `${train.ProductInformation[0].Description} ${
				train.AdvertisedTrainIdent
			} från ${train.FromLocation.map(placeName)} till ${train.ToLocation.map(placeName)} `;
		} else trainInfo = trainNumber;
	}

	function onClick(p) {
		return () => {
			trainNumber = p;
		};
	}

	$: points = (ps) =>
		ps.map((p) => `${x(p.Position.SWEREF99TM)},${y(p.Position.SWEREF99TM)}`).join(' ');

	onMount(async () => {
		if (data?.sseUrl) {
			eventSource = new EventSource(data.sseUrl);
			eventSource.onmessage = ({ data: s }) => {
				const json = JSON.parse(s);
				const [result] = json.RESPONSE.RESULT;

				result.TrainPosition.forEach((p) => {
					const key = p.Train.AdvertisedTrainNumber;
					const found = data.positions[key];
					if (!found) data.positions[key] = [p];
					else if (p.Position.SWEREF99TM !== found[0]?.Position?.SWEREF99TM) found.unshift(p);
				});

				data.positions = _.omitBy(
					_.mapValues(data.positions, (value) =>
						_.reject(
							value,
							({ TimeStamp }) => differenceInSeconds(new Date(), parseISO(TimeStamp)) > 120
						)
					),
					_.isEmpty
				);
			};
		}

		if (data?.positions) {
			const response = await fetch('position/train?id=' + Object.keys(data.positions).join(','));
			if (response.ok) trains = await response.json();
		}
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
	});
</script>

<div class="page">
	<div>
		{scale}
		<input type="range" min="4" max="10" step="1" bind:value={logScale} />
		{places[centered]?.name}
	</div>
	<div>
		{trainInfo}
	</div>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640">
		{#each Object.keys(places) as place}
			<text
				x={x(places[place].sweref99tm)}
				y={y(places[place].sweref99tm)}
				text-anchor="middle"
				style="fill: gray;"
				on:click={center(place)}
				on:keydown={center(place)}
				role="button"
				tabindex="0"
			>
				{place}
			</text>
		{/each}
		{#each Object.values(data.positions) as ps}
			<polyline
				points={points(ps)}
				stroke={fill(trains[ps[0].Train.AdvertisedTrainNumber])}
				fill="none"
			/>
			<circle
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="5"
				fill="black"
			/>
			<circle
				role="button"
				tabindex="0"
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="4"
				fill={fill(trains[ps[0].Train.AdvertisedTrainNumber])}
				on:click={onClick(ps[0].Train.AdvertisedTrainNumber)}
				on:keydown={onClick(ps[0].Train.AdvertisedTrainNumber)}
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
