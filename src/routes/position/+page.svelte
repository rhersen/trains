<script>
	import places from '$lib/sweref99tm.json';
	import { onDestroy, onMount } from 'svelte';
	export let data;

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
		return () => console.log(ps[0].Train.AdvertisedTrainNumber, ps[0].Speed, ps.length);
	}

	onMount(() => {
		if (!data?.sseUrl) return;

		eventSource = new EventSource(data.sseUrl);
		eventSource.onmessage = ({ data: s }) => {
			const updated = { ...data.positions };
			JSON.parse(s).RESPONSE.RESULT[0].TrainPosition.forEach((p) => {
				const key = `id${p.Train.AdvertisedTrainNumber}`;
				const found = updated[key];
				if (!found) updated[key] = [p];
				else found.unshift(p);
			});
			data.positions = updated;
		};
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
	});
</script>

<div>
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
			{#each ps as p}
				<circle
					cx={x(p.Position.SWEREF99TM)}
					cy={y(p.Position.SWEREF99TM)}
					r="1"
					fill="hsl({ps[0].Bearing}, 100%, 27.5%)"
				/>
			{/each}
			<circle
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="1.5"
				fill="black"
			/>
			<circle
				role="button"
				tabindex="0"
				cx={x(ps[0].Position.SWEREF99TM)}
				cy={y(ps[0].Position.SWEREF99TM)}
				r="1"
				fill="hsl({ps[0].Bearing}, 100%, 27.5%)"
				on:click={onClick(ps)}
				on:keydown={onClick(ps)}
			/>
		{/each}
	</svg>
</div>

<style>
	div {
		background-color: antiquewhite;
	}
	svg {
		width: 100vw;
		font-family: sans-serif;
		font-size: 2px;
	}
	circle:focus {
		outline: none;
	}
</style>
