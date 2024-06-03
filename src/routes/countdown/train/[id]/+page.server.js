import { error } from '@sveltejs/kit';
import announcements from '$lib/announcements.js';

export const load = async ({ params }) => {
	const { id } = params;

	const announcementsResponse = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody({ id }),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});
	if (!announcementsResponse.ok)
		throw error(announcementsResponse.status, announcementsResponse.statusText);

	const { RESPONSE } = await announcementsResponse.json();
	const found = RESPONSE.RESULT[0].TrainAnnouncement.find(({ ToLocation }) => ToLocation);

	return {
		AdvertisedTrainIdent: found?.AdvertisedTrainIdent,
		FromLocation: found?.FromLocation,
		ProductInformation: found?.ProductInformation,
		ToLocation: found?.ToLocation,
		ViaToLocation: found?.ViaToLocation,
		announcements: RESPONSE.RESULT[0].TrainAnnouncement.filter(announcements),
		sseUrl: RESPONSE.RESULT[0].INFO?.SSEURL
	};
};

function getBody({ id }) {
	const now = Date.now();
	const since = new Date(now - 12 * 60 * 6e4).toISOString();
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
