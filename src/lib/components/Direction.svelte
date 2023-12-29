<script>
	import Branch from '$lib/components/Branch.svelte';

	export let branches;
	export let lines;
</script>

<div class="parent">
	<Branch trains={branches.nw ?? []} div="1" {lines} />
	<Branch trains={branches.ne ?? []} div="2" {lines} />
	<Branch trains={branches.c ?? []} div="3" {lines} />
	<Branch trains={branches.sw ?? []} div="4" {lines} />
	<Branch trains={branches.se ?? []} div="5" {lines} />
</div>

<style>
	.parent {
		display: grid;
		grid-template-columns: 2fr 2fr 3fr 1fr;
		grid-template-rows: repeat(3, auto);
		grid-column-gap: 0;
		grid-row-gap: 0;
		background-color: lightcyan;
	}
</style>
