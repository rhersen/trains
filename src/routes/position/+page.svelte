<script>
	import _ from 'lodash';
	import { differenceInSeconds, parseISO } from 'date-fns';
	import { onDestroy, onMount } from 'svelte';
	import places from '$lib/sweref99tm.json';
	import { position as fill } from '$lib/color.js';
	export let data;

	let coords = /([\d.]+) ([\d.]+)/;

	let trains = _.mapValues(
		_.groupBy(data.announcements, (train) => train.AdvertisedTrainIdent),
		_.first
	);

	let announcementSource;
	let positionSource;

	let selectedTrainNumber;
	let trainInfo = '';
	let centered = 'Mby';
	let logScale = 8;
	let now = Date.now();

	$: scale = 2 ** logScale;

	$: centerMatch = places[centered]?.sweref99tm?.match(coords);
	$: xOffset = 240 - centerMatch[1] / scale;
	$: yOffset = Number(centerMatch[2]) / scale + 320;

	$: xCoord = (sweref) => {
		const center = places[centered]?.sweref99tm?.match(coords)[1];
		const xOffset = center - 240 * scale;
		return sweref / scale - xOffset / scale;
	};

	$: yCoord = (sweref) => {
		const center = Number(places[centered]?.sweref99tm?.match(coords)[2]);
		const yOffset = center + 320 * scale;
		return yOffset / scale - sweref / scale;
	};

	$: interpolate = (train) => {
		const p0 = train.positions[0];
		if (!p0) return [0, 0];
		const p1 = train.positions[1];
		if (!p1 || train.atStation) return p0.Position.SWEREF99TM.match(coords).slice(1);

		const dt = differenceInSeconds(parseISO(p1.TimeStamp), parseISO(p0.TimeStamp));
		const d = differenceInSeconds(now, parseISO(p0.TimeStamp));
		const coords0 = p0.Position.SWEREF99TM.match(coords);
		const coords1 = p1.Position.SWEREF99TM.match(coords);
		const x0 = Number(coords0[1]);
		const y0 = Number(coords0[2]);
		const x1 = Number(coords1[1]);
		const y1 = Number(coords1[2]);

		return [x0 + ((x1 - x0) * d) / dt, y0 + ((y1 - y0) * d) / dt];
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

	$: if (selectedTrainNumber) {
		const train = trains[selectedTrainNumber];
		if (train) {
			trainInfo = `${train.ProductInformation[0].Description} ${
				train.AdvertisedTrainIdent
			} från ${train.FromLocation.map(placeName)} till ${train.ToLocation.map(placeName)} `;
		} else trainInfo = selectedTrainNumber;
	}

	function setSelectedTrainNumber(trainNumber) {
		return () => {
			selectedTrainNumber = trainNumber;
		};
	}

	$: points = (ps) =>
		ps
			.map((p) => {
				const match = p.Position.SWEREF99TM.match(coords);
				return `${match[1] / scale},${match[2] / -scale}`;
			})
			.join(' ');

	function addPosition(p) {
		const train = trains[p.Train.AdvertisedTrainNumber];
		if (train) {
			trains[p.Train.AdvertisedTrainNumber].positions = [
				p,
				..._.reject(
					train.positions,
					({ TimeStamp }) => differenceInSeconds(new Date(), parseISO(TimeStamp)) > 180
				)
			];
		} /* else {
			console.log('position train not found', p.Train.AdvertisedTrainNumber);
		}*/
	}

	function addAnnouncement(a) {
		const train = trains[a.AdvertisedTrainIdent];
		if (!train) {
			console.log(a.AdvertisedTrainIdent, 'announcement train not found', a);
			trains[a.AdvertisedTrainIdent] = a;
			a.positions = [];
			console.log(a.AdvertisedTrainIdent, 'announcement train added', a);
		} else {
			train.atStation = a.ActivityType === 'Ankomst' ? a.LocationSignature : null;
		}
	}

	const interval = setInterval(() => (now = Date.now()), 2000);

	onMount(async () => {
		if (data?.ssePosition) {
			positionSource = new EventSource(data.ssePosition);
			positionSource.onmessage = ({ data: s }) => {
				const json = JSON.parse(s);
				const [result] = json.RESPONSE.RESULT;
				result.TrainPosition.forEach(addPosition);
			};
		}

		if (data?.sseAnnouncement) {
			announcementSource = new EventSource(data.sseAnnouncement);
			announcementSource.onmessage = ({ data: s }) => {
				const json = JSON.parse(s);
				const [result] = json.RESPONSE.RESULT;
				result.TrainAnnouncement.forEach(addAnnouncement);
			};
		}
	});

	onDestroy(() => {
		if (positionSource) positionSource.close();
		if (announcementSource) announcementSource.close();
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
				x={xCoord(places[place].sweref99tm.match(coords)[1])}
				y={yCoord(places[place].sweref99tm.match(coords)[2])}
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
		{#each Object.values(trains) as train}
			<g transform={`translate(${xOffset},${yOffset})`}>
				<polyline points={points(train.positions)} stroke={fill(train)} fill="none" />
				<g
					transform={`translate(${interpolate(train)[0] / scale},${
						interpolate(train)[1] / -scale
					}) rotate(${train.positions[0]?.Bearing || 0})`}
				>
					<polygon
						points={train.positions[0]?.Bearing ? '0 -2 4 8 -4 8' : '-6 -6 0 -6 0 0 -6 0'}
						role="button"
						tabindex="0"
						stroke={train.atStation ? 'red' : 'black'}
						fill={fill(train)}
						on:click={setSelectedTrainNumber(train.positions[0]?.Train.AdvertisedTrainNumber)}
						on:keydown={setSelectedTrainNumber(train.positions[0]?.Train.AdvertisedTrainNumber)}
					/>
				</g>
			</g>
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
