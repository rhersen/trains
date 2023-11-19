import { error } from '@sveltejs/kit';
import { add, formatISO, sub } from 'date-fns';

export const load = async ({ params }) => {
	const { TrainAnnouncement, INFO } = await fetchAnnouncements(params);
	return {
		TrainAnnouncement,
		sseUrl: INFO?.SSEURL,
		stations: stations()
	};
};

async function fetchAnnouncements() {
	console.time('fetch');
	const r = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: getBody(),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});
	console.timeEnd('fetch');
	if (!r.ok) {
		console.log(await r.text());
		throw error(r.status, r.statusText);
	}

	const { RESPONSE } = await r.json();
	const [announcements] = RESPONSE.RESULT;
	return announcements;
}

function getBody() {
	const now = Date.now();
	const since = formatISO(sub(now, { minutes: 100 }));
	const until = formatISO(add(now, { minutes: 100 }));
	return `
        <REQUEST>
            <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}'/>
            <QUERY sseurl='false' objecttype='TrainAnnouncement' orderby='TimeAtLocationWithSeconds' schemaversion='1.6'>
                <FILTER>
                    <IN name='LocationSignature' value='${stations()}'/>
                    <AND>
                        <GT name='AdvertisedTimeAtLocation' value='${since}'/>
                        <LT name='AdvertisedTimeAtLocation' value='${until}'/>
                    </AND>
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

function stations() {
	return [
		'Mr',
		'Bra',
		'Rs',
		'Skby',
		'Upv',
		'R',
		'Nvk',
		'Hgv',
		'Sol',
		'Hel',
		'Udl',
		'So',
		'Tmö',
		'Sod',
		'Sci',
		'Sst',
		'Åbe',
		'Äs',
		'Sta',
		'Hu',
		'Flb',
		'Tul',
		'Uts',
		'Tu',
		'Södy',
		'Gau',
		'Rön',
		'Dån',
		'Öte',
		'Söd'
	];
}
