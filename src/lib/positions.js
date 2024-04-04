export function concat(oldPositions, newPositions) {
	return [
		...oldPositions.filter(
			(oldPosition) =>
				!newPositions.some(
					(newPosition) =>
						oldPosition.Train.AdvertisedTrainNumber === newPosition.Train.AdvertisedTrainNumber
				)
		),
		...newPositions
	];
}
