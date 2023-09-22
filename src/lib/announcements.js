export default ({ ActivityType, LocationSignature, ToLocation = [] }) =>
	ActivityType === 'Avgang' ||
	ToLocation.some(({ LocationName }) => LocationName === LocationSignature);
