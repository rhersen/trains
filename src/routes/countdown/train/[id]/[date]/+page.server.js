import { error } from '@sveltejs/kit';
import * as announcements from '$lib/announcements.js';

const apiUrl = 'https://api.trafikinfo.trafikverket.se/v2/data.json';
const headers = { 'Content-Type': 'application/xml', Accept: 'application/json' };

export const load = async ({ params }) => {
	const { id, date } = params;

	if (!id) throw error(400, 'Missing train id.');
	if (!date) throw error(400, 'Missing date.');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw error(400, 'Invalid date. Expected YYYY-MM-DD.');

	const result = await fetchTrafikverket(
		announcementQuery({ trainIdent: id, departureDate: date })
	);

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
	}

	throw error(response.status, response.statusText);
}

function announcementQuery({ trainIdent, departureDate }) {
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
  <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='true' schemaversion='1.6'>
    <FILTER>
      <AND>
        <NE name='Canceled' value='true' />
        <EQ name='AdvertisedTrainIdent' value='${trainIdent}' />
        <EQ name='ScheduledDepartureDateTime' value='${departureDate}' />
        <OR>
          <EQ name='Advertised' value='true' />
          <EXISTS name='TimeAtLocation' value='true' />
        </OR>
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
    <INCLUDE>ScheduledDepartureDateTime</INCLUDE>
    <INCLUDE>TimeAtLocation</INCLUDE>
    <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
    <INCLUDE>ToLocation</INCLUDE>
    <INCLUDE>TrackAtLocation</INCLUDE>
    <INCLUDE>ViaToLocation</INCLUDE>
  </QUERY>
</REQUEST>
`;
}
