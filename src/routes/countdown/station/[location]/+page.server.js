import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const { location } = params;

	const r = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody({ location }),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});
	if (!r.ok) throw error(r.status, r.statusText);

	const { RESPONSE } = await r.json();
	const [announcements] = RESPONSE.RESULT;
	return {
		location,
		announcements: announcements.TrainAnnouncement,
		sseUrl: announcements.INFO?.SSEURL
	};
};

function getBody({ location }) {
	const now = Date.now();
	const since = new Date(now - 30 * 6e4).toISOString();
	const until = new Date(now + 12 * 60 * 6e4).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
  <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='true' schemaversion='1.6'>
    <FILTER>
      <AND>
        <NE name='Canceled' value='true' />
        <EQ name='Advertised' value='true' />
        <EQ name='ActivityType' value='Avgang' />
        <EQ name='LocationSignature' value='${location}' />
        <OR>
          <GT name='AdvertisedTimeAtLocation' value='${since}' />
          <GT name='EstimatedTimeAtLocation' value='${since}' />
        </OR>
        <LT name='AdvertisedTimeAtLocation' value='${until}' />
      </AND>
    </FILTER>
    <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
    <INCLUDE>ScheduledDepartureDateTime</INCLUDE>
    <INCLUDE>Deviation</INCLUDE>
    <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
    <INCLUDE>FromLocation</INCLUDE>
    <INCLUDE>ProductInformation</INCLUDE>
    <INCLUDE>TimeAtLocation</INCLUDE>
    <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
    <INCLUDE>ToLocation</INCLUDE>
    <INCLUDE>TrackAtLocation</INCLUDE>
  </QUERY>
</REQUEST>
`;
}
