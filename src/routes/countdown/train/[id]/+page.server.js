import { error } from '@sveltejs/kit';
import * as announcements from '$lib/announcements.js';

const apiUrl = 'https://api.trafikinfo.trafikverket.se/v2/data.json';
const headers = { 'Content-Type': 'application/xml', Accept: 'application/jsn' };

export const load = async ({ params }) => {
	const { id } = params;
	const result = await fetchTrafikverket(announcementQuery({ id }));

	return {
		announcements: announcements.filter(result.TrainAnnouncement),
		sseUrl: result.INFO?.SSEURL
	};
};

async function fetchTrafikverket(body) {
	const response = await fetch(apiUrl, { method: 'POST', body, headers });

	if (response.ok) {
		const { RESPONSE } = await response.json();
		const [result] = RESPONSE.RESULT;
		return result;
	} else {
		throw error(response.status, response.statusText);
	}
}

function announcementQuery({ id }) {
	const now = Date.now();
	const since = new Date(now - 10 * 60 * 6e4).toISOString();
	const until = new Date(now + 12 * 60 * 6e4).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
     <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='true' schemaversion='1.6'>
      <FILTER>
         <AND>
            <NE name='Canceled' value='true' />
        	<EQ name='AdvertisedTrainIdent' value='${id}' />
            <OR>
               <EQ name='Advertised' value='true' />
               <EXISTS name='TimeAtLocation' value='true' />
            </OR>
            <OR>
               <GT name='AdvertisedTimeAtLocation' value='${since}' />
               <GT name='EstimatedTimeAtLocation' value='${since}' />
            </OR>
            <LT name='AdvertisedTimeAtLocation' value='${until}' />
         </AND>
      </FILTER>
      <INCLUDE>ActivityType</INCLUDE>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>Deviation</INCLUDE>
      <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
      <INCLUDE>FromLocation</INCLUDE>
      <INCLUDE>LocationSignature</INCLUDE>
      <INCLUDE>ProductInformation</INCLUDE>
      <INCLUDE>TimeAtLocation</INCLUDE>
      <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
      <INCLUDE>TrackAtLocation</INCLUDE>
      <INCLUDE>ViaToLocation</INCLUDE>
     </QUERY>
</REQUEST>`;
}
