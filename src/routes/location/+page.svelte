<script>
	function getLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		} else {
			document.getElementById('output').innerText = 'Geolocation is not supported by this browser.';
		}
	}

	function showPosition(position) {
		const lat = position.coords.latitude;
		const lon = position.coords.longitude;
		document.getElementById('output').innerText = `Latitude: ${lat}, Longitude: ${lon}`;
	}

	function showError(error) {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				alert('User denied the request for Geolocation.');
				break;
			case error.POSITION_UNAVAILABLE:
				alert('Location information is unavailable.');
				break;
			case error.TIMEOUT:
				alert('The request to get user location timed out.');
				break;
			case error.UNKNOWN_ERROR:
				alert('An unknown error occurred.');
				break;
		}
	}
</script>

<h1>Find My Location</h1>
<button on:click={getLocation}>Get Location</button>
<p id="output"></p>
