import { error } from '@sveltejs/kit';

// noinspection JSUnusedGlobalSymbols
export async function load() {
	const r = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody(),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});
	if (!r.ok) throw error(r.status, r.statusText);

	const { RESPONSE } = await r.json();
	const [announcements] = RESPONSE.RESULT;
	return {
		announcements: announcements.TrainAnnouncement
	};
}

const minutes = 6e4;

function getBody() {
	const since = new Date(Date.now() - 2 * minutes).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
  <QUERY objecttype='TrainAnnouncement' sseurl='false' schemaversion='1.6'>
   <FILTER>
     <EXISTS name='ProductInformation' value='true' />
     <GT name='TimeAtLocationWithSeconds' value='${since}' />
   </FILTER>
   <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
   <INCLUDE>ProductInformation</INCLUDE>
   <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
  </QUERY>
</REQUEST>`;
}
