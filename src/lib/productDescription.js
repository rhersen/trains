const oresund = /^(.resund)st.g$/;
const trains = /(.+t.g)en$/;

export default (product = []) =>
	product
		.filter(({ Code }) => Code !== 'PNA054')
		.map(({ Description: s }) => {
			if (/^SJ /.test(s))
				return s
					.replace(/nterCity/, 'C')
					.replace(/ional$/, '')
					.replace(/t.g$/, '');
			if (oresund.test(s)) return s.replace(oresund, '$1');
			if (trains.test(s)) return s.replace(trains, '$1');
			return s;
		})
		.join('/');
