<script>
	import _ from 'lodash';
	import { differenceInSeconds, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import places from '$lib/sweref99tm.json';
	import { position as fill } from '$lib/color.js';
	export let data;

	let trains = _.mapValues(
		_.groupBy(data.announcements, (train) => train.AdvertisedTrainIdent),
		_.first
	);

	let eventSource;

	let trainNumber;
	let trainInfo = '';
	let centered = 'Nba';
	let logScale = 6;
	let now = Date.now();

	$: scale = 2 ** logScale;

	$: x = (s) => {
		const center = places[centered]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/[\d.]+ /)[0];
		const xOffset = center.match(/[\d.]+ /)[0] - 240 * scale;
		return sweref / scale - xOffset / scale;
	};

	$: y = (s) => {
		const center = places[centered]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/ [\d.]+/)[0];
		const yOffset = Number(center.match(/ [\d.]+/)[0]) + 320 * scale;
		return yOffset / scale - sweref / scale;
	};

	$: interpolate = (p0, p1) => {
		if (!p1) {
			return p0.Position.SWEREF99TM;
		}
		const dt = differenceInSeconds(parseISO(p1.TimeStamp), parseISO(p0.TimeStamp));
		const d = differenceInSeconds(now, parseISO(p0.TimeStamp));
		const x0 = Number(p0.Position.SWEREF99TM.match(/[\d.]+ /)[0]);
		const y0 = Number(p0.Position.SWEREF99TM.match(/ [\d.]+/)[0]);
		const x1 = Number(p1.Position.SWEREF99TM.match(/[\d.]+ /)[0]);
		const y1 = Number(p1.Position.SWEREF99TM.match(/ [\d.]+/)[0]);
		return `POINT (${x0 + ((x1 - x0) * d) / dt} ${y0 + ((y1 - y0) * d) / dt})`;
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

	const interval = setInterval(() => (now = Date.now()), 1000);

	onMount(async () => {
		if (data?.sseUrl) {
			eventSource = new EventSource(data.sseUrl);
			eventSource.onmessage = ({ data: s }) => {
				const json = JSON.parse(s);
				const [result] = json.RESPONSE.RESULT;

				result.TrainPosition.forEach((p) => {
					const train = trains[p.Train.AdvertisedTrainNumber];
					if (train) {
						trains[p.Train.AdvertisedTrainNumber].positions = [
							p,
							..._.reject(
								train.positions,
								({ TimeStamp }) => differenceInSeconds(new Date(), parseISO(TimeStamp)) > 120
							)
						];
					} else {
						console.log('new train', p.Train.AdvertisedTrainNumber);
					}
				});
			};
		}
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
		clearInterval(interval);
	});

	data.positions.forEach((position) => {
		const train = trains[position.Train.AdvertisedTrainNumber];
		if (train) train.positions = [position];
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
		{#each Object.values(trains) as { positions: ps }}
			<polyline
				points={points(ps)}
				stroke={fill(trains[ps[0].Train.AdvertisedTrainNumber])}
				fill="none"
			/>
			<circle
				cx={x(interpolate(ps[0], ps[1], Date.now()))}
				cy={y(interpolate(ps[0], ps[1], Date.now()))}
				r="5"
				fill="black"
			/>
			<circle
				role="button"
				tabindex="0"
				cx={x(interpolate(ps[0], ps[1], Date.now()))}
				cy={y(interpolate(ps[0], ps[1], Date.now()))}
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
