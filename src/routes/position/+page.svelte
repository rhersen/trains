<script>
	import _ from 'lodash';
	import { differenceInSeconds, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import places from '$lib/sweref99tm.json';
	export let data;

	let eventSource;

	let train;
	let position;
	let trains = {};
	let location = 'Nba';
	let logScale = 6;

	$: scale = () => 2 ** logScale;

	$: x = (s) => {
		const s2 = places[location]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/[\d.]+ /)[0];
		const xOffset = s2.match(/[\d.]+ /)[0] - 240 * scale();
		return sweref / scale() - xOffset / scale();
	};

	$: y = (s) => {
		const s2 = places[location]?.sweref99tm ?? 'POINT (503403 6546585)';
		const sweref = s.match(/ [\d.]+/)[0];
		const yOffset = Number(s2.match(/ [\d.]+/)[0]) + 320 * scale();
		return yOffset / scale() - sweref / scale();
	};

	function center(place) {
		return () => {
			location = place;
		};
	}

	function locationName(location) {
		return location.LocationName;
	}

	function placeName(location) {
		return places[location.LocationName]?.name;
	}

	function trainInfo(train) {
		if (train) {
			return `${train.ProductInformation[0].Description} ${
				train.AdvertisedTrainIdent
			} från ${train.FromLocation.map(placeName)} till ${train.ToLocation.map(placeName)} ${
				position.Speed
			}`;
		}

		if (position) return position.Train.AdvertisedTrainNumber;
	}

	function onClick(p) {
		return () => {
			position = p;
			train = trains[p.Train.AdvertisedTrainNumber];
		};
	}

	$: points = (ps) =>
		ps.map((p) => `${x(p.Position.SWEREF99TM)},${y(p.Position.SWEREF99TM)}`).join(' ');

	function fill(p) {
		const train = trains[p.Train.AdvertisedTrainNumber];
		if (train) {
			const code = train.ProductInformation[0].Code;
			if (code === 'PNA014') return `hsl(0, 0%, 30%)`;
			const location = train.ToLocation?.map(locationName).join();
			if (location === 'Sci') return `hsl(0, 100%, 40%)`;
			if (location === 'U') return `hsl(30, 100%, 40%)`;
			if (location === 'Mr') return `hsl(60, 100%, 40%)`;
			if (location === 'Tu') return `hsl(120, 100%, 40%)`;
			if (location === 'Söc') return `hsl(180, 100%, 40%)`;

			if (location === 'Bål') return `hsl(0, 60%, 30%)`;
			if (location === 'Khä') return `hsl(60, 60%, 30%)`;
			if (location === 'Kän') return `hsl(30, 60%, 30%)`;
			if (location === 'Vhe') return `hsl(120, 60%, 30%)`;
			if (location === 'Nyc') return `hsl(180, 60%, 30%)`;
		}

		return `hsl(${p.Bearing}, 0%, 70%)`;
	}

	onMount(async () => {
		if (data?.sseUrl) {
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
						return seconds > 120;
					})
				);
				data.positions = _.omitBy(filtered, _.isEmpty);
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
		{scale()}
		{logScale}
		<input type="range" min="4" max="10" step="1" bind:value={logScale} />
		{places[location]?.name}
	</div>
	<div>
		{trainInfo(train)}
	</div>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 640">
		<rect x="0" y="0" width="480" height="640" fill="white" />
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
			<polyline points={points(ps)} stroke={fill(ps[0])} fill="none" />
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
				fill={fill(ps[0])}
				on:click={onClick(ps[0])}
				on:keydown={onClick(ps[0])}
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
