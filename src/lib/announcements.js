export function filter(announcements) {
	const countsByLocationAndTime = new Map();
	const statusByLocationAndTime = new Map();

	for (const {
		LocationSignature,
		AdvertisedTimeAtLocation,
		ActivityType,
		TimeAtLocationWithSeconds
	} of announcements) {
		if (!LocationSignature || !AdvertisedTimeAtLocation) continue;
		const key = `${LocationSignature}__${AdvertisedTimeAtLocation}`;

		countsByLocationAndTime.set(key, (countsByLocationAndTime.get(key) || 0) + 1);

		const status = statusByLocationAndTime.get(key) || {
			hasAnkomstWithSeconds: false,
			hasAvgangWithoutSeconds: false
		};
		if (ActivityType === 'Ankomst' && TimeAtLocationWithSeconds) {
			status.hasAnkomstWithSeconds = true;
		}
		if (ActivityType === 'Avgang' && !TimeAtLocationWithSeconds) {
			status.hasAvgangWithoutSeconds = true;
		}
		statusByLocationAndTime.set(key, status);
	}

	return announcements.filter(
		({ ActivityType, LocationSignature, AdvertisedTimeAtLocation, TimeAtLocationWithSeconds }) => {
			if (LocationSignature && AdvertisedTimeAtLocation) {
				const key = `${LocationSignature}__${AdvertisedTimeAtLocation}`;
				const hasDuplicate = (countsByLocationAndTime.get(key) || 0) > 1;
				const status = statusByLocationAndTime.get(key);

				const preserveAnkomst =
					ActivityType === 'Ankomst' &&
					TimeAtLocationWithSeconds &&
					status?.hasAvgangWithoutSeconds;

				if (hasDuplicate && ActivityType === 'Ankomst' && !preserveAnkomst) {
					return false;
				}
			}

			return true;
		}
	);
}
