<script>
	import productDescription from '$lib/productDescription.js';

	export let announcement;
</script>

<td>
	{productDescription(announcement.ProductInformation)}
</td>

<style>
	td {
		border: 1px solid grey;
		font-size: 22px;
		font-family: Palatino, serif;
		text-align: left;
		padding: 0 2px;
	}

	@media (max-width: 711px) {
		td {
			display: none;
		}
	}
</style>
