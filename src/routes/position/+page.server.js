import { error } from '@sveltejs/kit';
import _ from 'lodash';

export const load = async () => {
	const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: query(),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});

	if (!response.ok) throw error(response.status, response.statusText);

	const { RESPONSE } = await response.json();
	const [result] = RESPONSE.RESULT;

	return {
		positions: _.groupBy(
			result.TrainPosition,
			(trainPosition) => trainPosition.Train.AdvertisedTrainNumber
		),
		sseUrl: result.INFO?.SSEURL
	};
};

const minutes = 6e4;

function query() {
	const since = new Date(Date.now() - 3 * minutes).toISOString();
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
