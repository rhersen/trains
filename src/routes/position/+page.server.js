import { error } from '@sveltejs/kit';
import _ from 'lodash';

export const load = async () => {
	const headers = {
		'Content-Type': 'application/xml',
		Accept: 'application/json'
	};
	const url = 'https://api.trafikinfo.trafikverket.se/v2/data.json';

	const positionPromise = fetch(url, {
		method: 'POST',
		body: positionQuery(),
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

function positionQuery() {
	const since = new Date(Date.now() - 5 * minutes).toISOString();
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
    <QUERY objecttype='TrainPosition' namespace='järnväg.trafikinfo' sseurl='true' schemaversion='1.1'>
    <FILTER>
      <GT name='TimeStamp' value='${since}'/>
      <WITHIN name="Position.SWEREF99TM" shape="box" value="632000 6532000, 679000 6639000"/>
    </FILTER>
    <INCLUDE>Bearing</INCLUDE>
    <INCLUDE>Position</INCLUDE>
    <INCLUDE>Speed</INCLUDE>
    <INCLUDE>TimeStamp</INCLUDE>
    <INCLUDE>Train</INCLUDE>
  </QUERY>
</REQUEST>`;
}
