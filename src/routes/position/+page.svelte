<script>
	import places from '$lib/sweref99tm.json';
	export let data;

	const scale = 0b100110000000;

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
		{#each data.positions as position}
			<text
				x={x(position.Position.SWEREF99TM)}
				y={y(position.Position.SWEREF99TM)}
				text-anchor="middle"
				style="fill: darkred; font-size: 8px">{position.Speed}</text
			>
		{/each}
	</svg>
</div>

<style>
	div {
		background-color: antiquewhite;
	}
	svg {
		height: 100vh;
		font-family: sans-serif;
		font-size: 4px;
	}
</style>
