import type { PageLoad } from './$types';

export const load = (({ params }) => {
	return { gameId: params.gameId };
}) satisfies PageLoad;
