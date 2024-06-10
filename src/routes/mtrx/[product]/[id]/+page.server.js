import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const now = Date.now();
	const method = 'POST';
	const headers = {
		'Content-Type': 'application/xml',
		Accept: 'application/json'
	};
	const since = new Date(now - 2 * 6e4).toISOString();
	const positionPromise = fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method,
		headers,
		body: positionQuery({ id: params.id, since })
	});
	const todayPromise = fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method,
		headers,
		body: announcementQuery({ id: params.id, since })
	});
	const [positionResponse, todayResponse] = await Promise.all([positionPromise, todayPromise]);
	if (!positionResponse.ok) throw error(positionResponse.status, positionResponse.statusText);
	if (!todayResponse.ok) throw error(todayResponse.status, todayResponse.statusText);
	const todayJson = await todayResponse.json();
	const positionJson = await positionResponse.json();

	return {
		id: params.id,
		events: [
			...todayJson.RESPONSE.RESULT[0].TrainAnnouncement,
			...positionJson.RESPONSE.RESULT[0].TrainPosition
		],
		ssePositions: positionJson.RESPONSE.RESULT[0].INFO?.SSEURL,
		sseAnnouncements: todayJson.RESPONSE.RESULT[0].INFO?.SSEURL
	};
};

function announcementQuery({ id, since }) {
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
     <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='true' schemaversion='1.6'>
      <FILTER>
         <AND>
        	<EQ name='AdvertisedTrainIdent' value='${id}' />
            <GT name='TimeAtLocationWithSeconds' value='${since}' />
         </AND>
      </FILTER>
      <INCLUDE>ActivityType</INCLUDE>
      <INCLUDE>LocationSignature</INCLUDE>
      <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
     </QUERY>
</REQUEST>`;
}

function positionQuery({ id, since }) {
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
    <QUERY objecttype='TrainPosition' namespace='järnväg.trafikinfo' sseurl='true' schemaversion='1.1'>
    <FILTER>
        <GT name='TimeStamp' value='${since}'/>
		<EQ name='Train.AdvertisedTrainNumber' value='${id}' />
    </FILTER>
    <INCLUDE>Bearing</INCLUDE>
    <INCLUDE>Position</INCLUDE>
    <INCLUDE>Speed</INCLUDE>
    <INCLUDE>TimeStamp</INCLUDE>
    <INCLUDE>Train</INCLUDE>
  </QUERY>
</REQUEST>`;
}
