import { error } from '@sveltejs/kit';
import _ from 'lodash';

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
		positions: _.groupBy(
			positionJson.RESPONSE.RESULT[0].TrainPosition,
			(trainPosition) => trainPosition.Train.AdvertisedTrainNumber
		),
		sseUrl: positionJson.RESPONSE.RESULT[0].INFO?.SSEURL
	};
};

const minutes = 6e4;

const trainGroups = {
	x2000: '/^[1378]..$/',
	sl: '/2[2-9]..$/',
	sln: '/2[2-9].[02468]$/',
	sls: '/2[2-9].[13579]$/'
};

function positionQuery() {
	const since = new Date(Date.now() - 5 * minutes).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
    <QUERY objecttype='TrainPosition' namespace='järnväg.trafikinfo' sseurl='true' schemaversion='1.1'>
    <FILTER>
        <GT name='TimeStamp' value='${since}'/>
        <OR>
        	<LIKE name='Train.AdvertisedTrainNumber' value='${trainGroups.sl}'/>
		</OR>
    </FILTER>
    <INCLUDE>Bearing</INCLUDE>
    <INCLUDE>Position</INCLUDE>
    <INCLUDE>Speed</INCLUDE>
    <INCLUDE>TimeStamp</INCLUDE>
    <INCLUDE>Train</INCLUDE>
  </QUERY>
</REQUEST>`;
}
