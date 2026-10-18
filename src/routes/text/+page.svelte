<script>
	import { onDestroy, onMount } from 'svelte';
	import grouped from '$lib/branches.js';
	import Direction from '$lib/components/Direction.svelte';

	export let data;

	let mounted = false;
	let eventSource;

	$: announcements = data.TrainAnnouncement ?? [];
	$: north = grouped(
		announcements.filter(({ AdvertisedTrainIdent }) => /[02468]$/.test(AdvertisedTrainIdent))
	);
	$: south = grouped(
		announcements.filter(({ AdvertisedTrainIdent }) => /[13579]$/.test(AdvertisedTrainIdent))
	);
	$: if (mounted) connect(data.sseUrl);

	function connect(sseUrl) {
		if (eventSource) eventSource.close();
		if (!sseUrl) return;

		eventSource = new EventSource(sseUrl);
		eventSource.onmessage = ({ data: s }) => {
			const { RESPONSE } = JSON.parse(s);
			const [{ TrainAnnouncement = [] }] = RESPONSE.RESULT;
			announcements = [...TrainAnnouncement, ...announcements];
		};
	}

	onMount(() => {
		mounted = true;
	});

	onDestroy(() => {
		if (eventSource) eventSource.close();
	});
</script>

<div>Norrgående</div>
<Direction branches={north} lines={2} />

<div>Södergående</div>
<Direction branches={south} lines={2} />

<style>
	div {
		text-align: center;
		font-family: Arial, sans-serif;
		font-weight: bold;
	}

	div:not(:first-child) {
		margin-top: 1em;
	}
</style>
