import { error } from '@sveltejs/kit';

// noinspection JSUnusedGlobalSymbols
export async function load({ params }) {
	const { product } = params;

	const r = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody(product),
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

function getBody(product) {
	const since = new Date(Date.now() - 2 * minutes).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
  <QUERY objecttype='TrainAnnouncement' sseurl='false' schemaversion='1.6'>
   <FILTER>
     <EQ name='ProductInformation.Code' value='${product}'/>
     <GT name='TimeAtLocationWithSeconds' value='${since}' />
   </FILTER>
   <INCLUDE>ActivityType</INCLUDE>
   <INCLUDE>AdvertisedTrainIdent</INCLUDE>
   <INCLUDE>FromLocation</INCLUDE>
   <INCLUDE>LocationSignature</INCLUDE>
   <INCLUDE>ProductInformation</INCLUDE>
   <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
   <INCLUDE>ToLocation</INCLUDE>
  </QUERY>
</REQUEST>`;
}
