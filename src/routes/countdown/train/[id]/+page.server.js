import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const defaultDate = new Intl.DateTimeFormat('en-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(new Date());

	throw redirect(307, `/countdown/train/${params.id}/${defaultDate}`);
};
