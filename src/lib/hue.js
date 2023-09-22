export default (delay) => {
	if (delay === undefined) return;
	if (delay < -120) return 180;
	if (delay < 120) return (240 - delay) / 2;
	if (delay > 480) return -30;
	return (360 - delay) / 4;
};
