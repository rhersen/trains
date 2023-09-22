import { error } from '@sveltejs/kit';

export async function load() {
	const responses = await Promise.all([
		fetch('https://trafikverket-locations.netlify.app/geometry.json'),
		fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
			method: 'POST',
			body: getBody(),
			headers: {
				'Content-Type': 'application/xml',
				Accept: 'application/json'
			}
		})
	]);

	responses.forEach((response) => {
		if (!response.ok) throw error(response.status, response.statusText);
	});

	const [locations, announcements] = await Promise.all(
		responses.map((response) => response.json())
	);

	const result = announcements.RESPONSE.RESULT;
	const allDirections = result.flatMap(({ TrainAnnouncement }) => TrainAnnouncement);
	return {
		locations,
		announcements: allDirections.filter(({ AdvertisedTrainIdent, LocationSignature }) => {
			const southbound = parseInt(AdvertisedTrainIdent) % 2;
			if (southbound) return LocationSignature !== 'So' && LocationSignature !== 'Tul';
			else return LocationSignature !== 'Sub';
		})
	};
}

function getBody() {
	return `
<REQUEST>
    <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}'/>
    <QUERY sseurl='false' objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' schemaversion='1.6'>
        <FILTER>
            <GT name='AdvertisedTimeAtLocation' value='$dateadd(-0.01:00:00)'/>
            <LT name='AdvertisedTimeAtLocation' value='$dateadd(0.20:00:00)'/>
            <EQ name='Canceled' value='true'/>
            <EQ name='ActivityType' value='Avgang'/>
            <OR>
              <EQ name='LocationSignature' value='Mr'/>
              <EQ name='LocationSignature' value='Sub'/>
              <EQ name='LocationSignature' value='So'/>
              <EQ name='LocationSignature' value='Tul'/>
            </OR>
        </FILTER>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
        <INCLUDE>Canceled</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
        <INCLUDE>ProductInformation</INCLUDE>
        <INCLUDE>TimeAtLocation</INCLUDE>
        <INCLUDE>ToLocation</INCLUDE>
        <INCLUDE>FromLocation</INCLUDE>
    </QUERY>
</REQUEST>
`;
}
