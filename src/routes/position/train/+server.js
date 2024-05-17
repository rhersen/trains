import _ from 'lodash';
import { error } from '@sveltejs/kit';

export const GET = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) error(400, 'id is mandatory');

	const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody({ id }),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});

	if (!response.ok) error(response.status, response.statusText);

	const { RESPONSE } = await response.json();
	const [result] = RESPONSE.RESULT;
	const grouped = _.groupBy(result.TrainAnnouncement, (train) => train.AdvertisedTrainIdent);
	return new Response(JSON.stringify(_.mapValues(grouped, _.first)));
};

function getBody({ id }) {
	const now = Date.now();
	const windowMillis = 60 * 6e4;
	const since = new Date(now - windowMillis).toISOString();
	const until = new Date(now + windowMillis).toISOString();
	const ids = id
		.split(',')
		.map((s) => `<EQ name='AdvertisedTrainIdent' value='${s}' />`)
		.join(' ');
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
    <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='false' schemaversion='1.6'>
      <FILTER>
        <OR>${ids}</OR>
        <GT name='AdvertisedTimeAtLocation' value='${since}' />
        <LT name='AdvertisedTimeAtLocation' value='${until}' />
        <EXISTS name='ToLocation' value='true' />
      </FILTER>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
      <INCLUDE>FromLocation</INCLUDE>
      <INCLUDE>ProductInformation</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
      <INCLUDE>ViaToLocation</INCLUDE>
    </QUERY>
</REQUEST>`;
}
