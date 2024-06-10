<script>
	import _ from 'lodash';
	export let data;
	$: groups = _.groupBy(data.announcements, 'ProductInformation.0.Code');
</script>

<h1>Välj tågtyp</h1>

<ol>
	{#each Object.entries(groups) as [key, value]}
		<li>
			<a href="mtrx/{key}">
				{key}
				{value[0].ProductInformation[0].Description}
			</a>
		</li>
	{/each}
</ol>
