import { error } from '@sveltejs/kit';

export const GET = async ({ url }) => {
	const id = Number(url.searchParams.get('id'));
	if (!id) error(400, 'id is mandatory');

	const announcementsResponse = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody({ id }),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});
	if (!announcementsResponse.ok)
		error(announcementsResponse.status, announcementsResponse.statusText);

	const { RESPONSE } = await announcementsResponse.json();
	const found = RESPONSE.RESULT[0].TrainAnnouncement.find(({ ToLocation }) => ToLocation);

	return new Response(
		JSON.stringify({
			AdvertisedTrainIdent: found?.AdvertisedTrainIdent,
			FromLocation: found?.FromLocation,
			ProductInformation: found?.ProductInformation,
			ToLocation: found?.ToLocation,
			ViaToLocation: found?.ViaToLocation
		})
	);
};

function getBody({ id }) {
	const now = Date.now();
	const since = new Date(now - 12 * 60 * 6e4).toISOString();
	const until = new Date(now + 12 * 60 * 6e4).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
    <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='false' schemaversion='1.6'>
      <FILTER>
        <EQ name='AdvertisedTrainIdent' value='${id}' />
        <OR>
          <GT name='AdvertisedTimeAtLocation' value='${since}' />
          <GT name='EstimatedTimeAtLocation' value='${since}' />
        </OR>
        <LT name='AdvertisedTimeAtLocation' value='${until}' />
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
