import { error } from '@sveltejs/kit';
import _ from 'lodash';

async function positionResult() {
	const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: positionQuery(),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});

	if (!response.ok) throw error(response.status, response.statusText);

	const { RESPONSE } = await response.json();
	const [result] = RESPONSE.RESULT;
	return { trainPosition: result.TrainPosition, sseUrl: result.INFO?.SSEURL };
}

async function announcementResult(id) {
	const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		body: announcementQuery({ id }),
		headers: {
			'Content-Type': 'application/xml',
			Accept: 'application/json'
		}
	});

	if (!response.ok) throw error(response.status, response.statusText);

	const { RESPONSE } = await response.json();
	const [result] = RESPONSE.RESULT;
	return result.TrainAnnouncement;
}

export const load = async () => {
	const { trainPosition, sseUrl } = await positionResult();
	const positions = _.groupBy(trainPosition, ({ Train }) => Train.AdvertisedTrainNumber);
	const announcements = await announcementResult(Object.keys(positions));
	const grouped = _.groupBy(announcements, (train) => train.AdvertisedTrainIdent);
	return {
		positions,
		trains: _.mapValues(grouped, _.first),
		sseUrl: sseUrl
	};
};

const minutes = 6e4;

function positionQuery() {
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

function announcementQuery({ id }) {
	const now = Date.now();
	const windowMillis = 15 * 6e4;
	const since = new Date(now - windowMillis).toISOString();
	const ids = id.map((s) => `<EQ name='AdvertisedTrainIdent' value='${s}' />`).join(' ');
	return `
<REQUEST>
  <LOGIN authenticationkey='${process.env.TRAFIKVERKET_API_KEY}' />
    <QUERY objecttype='TrainAnnouncement' orderby='AdvertisedTimeAtLocation' sseurl='false' schemaversion='1.6'>
      <FILTER>
        <OR>${ids}</OR>
        <GT name='TimeAtLocationWithSeconds' value='${since}' />
        <EXISTS name='ToLocation' value='true' />
      </FILTER>
      <INCLUDE>TimeAtLocationWithSeconds</INCLUDE>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>FromLocation</INCLUDE>
      <INCLUDE>ProductInformation</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
    </QUERY>
</REQUEST>`;
}
