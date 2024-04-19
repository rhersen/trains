<script>
	import _ from 'lodash';
	import { differenceInSeconds, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import places from '$lib/sweref99tm.json';
	export let data;
	let selected = '';

	const scale = 0b100110000000;
	let eventSource;

	function x(s) {
		const number = s
			.substring(7, s.length - 1)
			.split(' ')
			.map(Number)[0];
		return (number - 100000) / scale;
	}

	function y(s) {
		const number = s
			.substring(7, s.length - 1)
			.split(' ')
			.map(Number)[1];
		return (7600000 - number) / scale;
	}

	function onClick(ps) {
		return async () => {
			console.log(ps[0].Train.AdvertisedTrainNumber, ps[0].Speed);
			const response = await fetch('position/train?id=' + ps[0].Train.AdvertisedTrainNumber);
			if (response.ok) {
				const train = await response.json();
				console.log(train);
				selected = `${train.ProductInformation.map((p) => p.Description)} ${
					train.AdvertisedTrainIdent
				} från ${train.FromLocation.map(locationName)} till ${train.ToLocation.map(locationName)} ${
					ps[0].Speed ? ` i ${ps[0].Speed} km/h` : ''
				}`;
			}

			function locationName(location) {
				return location.LocationName;
			}
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
	<span class="sticky">{selected}</span>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640">
		<rect x="0" y="0" width="360" height="640" fill="white" />
		{#each Object.keys(places) as place}
			<text
				x={x(places[place].sweref99tm)}
				y={y(places[place].sweref99tm)}
				text-anchor="middle"
				style="fill: gray;">{place}</text
			>
		{/each}
		{#each Object.values(data.positions) as ps}
			<polyline points={points(ps)} stroke="hsl({ps[0].Bearing}, 100%, 27.5%)" fill="none" />
			<circle
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="1"
				fill="black"
			/>
			<circle
				role="button"
				tabindex="0"
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="0.8"
				fill="hsl({ps[0].Bearing}, 100%, 27.5%)"
				on:click={onClick(ps)}
				on:keydown={onClick(ps)}
			/>
		{/each}
	</svg>
</div>

<style>
	.page {
		background-color: antiquewhite;
	}
	.sticky {
		position: sticky;
		top: 0;
		z-index: 100;
	}
	svg {
		font-family: sans-serif;
		font-size: 2px;
	}
	polyline {
		stroke-width: 1;
	}
</style>
