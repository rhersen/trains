import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const { id } = params;

	const headers = {
		'Content-Type': 'application/xml',
		Accept: 'application/json'
	};
	const url = 'https://api.trafikinfo.trafikverket.se/v2/data.json';

	const positionPromise = fetch(url, {
		method: 'POST',
		body: positionQuery({ id }),
		headers
	});

	const positionResponse = await positionPromise;

	if (!positionResponse.ok) throw error(positionResponse.status, positionResponse.statusText);

	const positionJson = await positionResponse.json();

	return {
		positions: positionJson.RESPONSE.RESULT[0].TrainPosition,
		sseUrl: positionJson.RESPONSE.RESULT[0].INFO?.SSEURL
	};
};

function positionQuery() {
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
    <QUERY objecttype='TrainPosition' namespace='järnväg.trafikinfo' sseurl='true' schemaversion='1.1'>
    <FILTER>
        <GT name='Speed' value='160' />
    </FILTER>
    <INCLUDE>Bearing</INCLUDE>
    <INCLUDE>Position</INCLUDE>
    <INCLUDE>Speed</INCLUDE>
    <INCLUDE>TimeStamp</INCLUDE>
    <INCLUDE>Train</INCLUDE>
  </QUERY>
</REQUEST>`;
}
