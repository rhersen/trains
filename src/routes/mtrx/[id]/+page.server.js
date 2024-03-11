import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const now = Date.now();
	const method = 'POST';
	const headers = {
		'Content-Type': 'application/xml',
		Accept: 'application/json'
	};
	const yesterdayPromise = fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method,
		headers,
		body: getBody({
			id: params.id,
			since: new Date(now - 36 * 60 * 6e4).toISOString(),
			until: new Date(now - 12 * 60 * 6e4).toISOString(),
			sse: 'false'
		})
	});
	const todayPromise = fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method,
		headers,
		body: getBody({
			id: params.id,
			since: new Date(now - 12 * 60 * 6e4).toISOString(),
			until: new Date(now + 12 * 60 * 6e4).toISOString(),
			sse: 'true'
		})
	});
	const [yesterdayResponse, todayResponse] = await Promise.all([yesterdayPromise, todayPromise]);
	if (!yesterdayResponse.ok) throw error(yesterdayResponse.status, yesterdayResponse.statusText);
	if (!todayResponse.ok) throw error(todayResponse.status, todayResponse.statusText);
	const todayJson = await todayResponse.json();
	const yesterdayJson = await yesterdayResponse.json();

	return {
		id: params.id,
		advertised: yesterdayJson.RESPONSE.RESULT[0].TrainAnnouncement,
		actual: todayJson.RESPONSE.RESULT[0].TrainAnnouncement,
		sseUrl: todayJson.RESPONSE.RESULT[0].INFO?.SSEURL
	};
};

function getBody({ id, since, until, sse }) {
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
     <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='${sse}' schemaversion='1.6'>
      <FILTER>
         <AND>
            <NE name='Canceled' value='true' />
            <EQ name='ActivityType' value='Avgang' />
        	<EQ name='AdvertisedTrainIdent' value='${id}' />
            <OR>
               <GT name='AdvertisedTimeAtLocation' value='${since}' />
               <GT name='EstimatedTimeAtLocation' value='${since}' />
            </OR>
            <LT name='AdvertisedTimeAtLocation' value='${until}' />
         </AND>
      </FILTER>
      <INCLUDE>ActivityType</INCLUDE>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>LocationSignature</INCLUDE>
      <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
     </QUERY>
</REQUEST>`;
}
