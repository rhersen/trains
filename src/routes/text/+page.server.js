import { error } from '@sveltejs/kit';
import { formatISO, sub } from 'date-fns';

// noinspection JSUnusedGlobalSymbols
export const load = async ({ params }) => {
	const { TrainAnnouncement, INFO } = await fetchAnnouncements(params);
	return {
		sseUrl: INFO?.SSEURL,
		TrainAnnouncement
	};
};

async function fetchAnnouncements() {
	const r = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody(),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});

	if (!r.ok) {
		throw error(r.status, r.statusText);
	}

	const { RESPONSE } = await r.json();
	const [announcements] = RESPONSE.RESULT;
	return announcements;
}

function getBody() {
	const now = Date.now();
	const since = formatISO(sub(now, { minutes: 24 }));
	return `
        <REQUEST>
            <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}'/>
            <QUERY sseurl='true' objecttype='TrainAnnouncement' orderby='TimeAtLocationWithSeconds' schemaversion='1.6'>
                <FILTER>
               	    <LIKE name='AdvertisedTrainIdent' value='/^(?:2[2-9]\\d\\d|12[89]\\d\\d|52[2-7]\\d\\d)$/' />
                    <GT name='TimeAtLocation' value='${since}'/>
                    <NOTIN name='LocationSignature' value='Söc,Söd,Söu,Bre,Jn,Mö,Gn,Bvr,Arne,Arnc,Myn,Kn,Eby,Säy,U'/>
                </FILTER>
                <INCLUDE>ActivityType</INCLUDE>
                <INCLUDE>AdvertisedTrainIdent</INCLUDE>
                <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
                <INCLUDE>LocationSignature</INCLUDE>
                <INCLUDE>ProductInformation</INCLUDE>
                <INCLUDE>TimeAtLocation</INCLUDE>
                <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
                <INCLUDE>ToLocation</INCLUDE>
            </QUERY>
        </REQUEST>`;
}
