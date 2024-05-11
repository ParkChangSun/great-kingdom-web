import { browser } from '$app/environment';
import { readonly, writable } from 'svelte/store';

type UserInfo = {
	authorized: boolean;
	id: string;
};
let initValue: UserInfo = { authorized: false, id: '' };
export const userInfoStore = writable(initValue);

if (browser) {
	const initStorage = localStorage.getItem('userInfo');
	if (initStorage) {
		userInfoStore.set(JSON.parse(initStorage));
	}
	userInfoStore.subscribe((value) => localStorage.setItem('userInfo', JSON.stringify(value)));
}

const _API_URL = writable('https://api.greatkingdom.net');
export const API_URL = readonly(_API_URL);

export const refreshToken = async () => {
	const res = await fetch('https://api.greatkingdom.net/tokenrefresh', {
		method: 'POST',
		credentials: 'include'
	});
	if (!res.ok) {
		userInfoStore.set({ authorized: false, id: '' });
		return false;
	}
	return true;
};
