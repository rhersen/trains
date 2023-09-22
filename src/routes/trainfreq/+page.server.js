import { error } from '@sveltejs/kit';

// noinspection JSUnusedGlobalSymbols
export async function load({ params }) {
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
		params,
		announcements: announcements.TrainAnnouncement
	};
}

function getBody() {
	const now = Date.now();
	const since = new Date(now).toISOString().substring(0, 10) + 'T03:00:00.000+02:00';
	const until =
		new Date(now + 24 * 60 * 6e4).toISOString().substring(0, 10) + 'T03:00:00.000+02:00';
	console.log(since, until);
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
     <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='false' schemaversion='1.6'>
      <FILTER>
         <AND>
            <NE name='Canceled' value='true' />
            <EQ name='Advertised' value='true' />
            <EQ name='ActivityType' value='Avgang' />
            <EQ name='LocationSignature' value='Tul' />
        	<LIKE name='AdvertisedTrainIdent' value='/[02468]$/' />
		   	<GT name='AdvertisedTimeAtLocation' value='${since}' />
            <LT name='AdvertisedTimeAtLocation' value='${until}' />
         </AND>
      </FILTER>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>Deviation</INCLUDE>
      <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
      <INCLUDE>FromLocation</INCLUDE>
      <INCLUDE>ProductInformation</INCLUDE>
      <INCLUDE>TimeAtLocation</INCLUDE>
      <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
      <INCLUDE>TrackAtLocation</INCLUDE>
     </QUERY>
</REQUEST>`;
}
