import { browser } from '$app/environment';
import { derived, readonly, writable } from 'svelte/store';
import translations from './translation'

type UserInfo = {
	authorized: boolean;
	id: string;
};
let initValue: UserInfo = { authorized: false, id: '' };
export const userInfoStore = writable(initValue);

// if (browser) {
// 	console.log('browser');

// 	const initStorage = localStorage.getItem('userInfo');
// 	if (initStorage) {
// 		userInfoStore.set(JSON.parse(initStorage));
// 	}
// 	userInfoStore.subscribe((value) => localStorage.setItem('userInfo', JSON.stringify(value)));
// }

const _API_URL = writable('https://api.greatkingdom.net');
export const API_URL = readonly(_API_URL);

export const refreshToken = async () => {
	const res = await fetch('https://api.greatkingdom.net/tokenrefresh', {
		method: 'POST',
		credentials: 'include'
	});
	if (res.ok) {
		const j = await res.json()
		userInfoStore.set({ authorized: true, id: j.Id })
	} else {
		userInfoStore.set({ authorized: false, id: '' });
	}
};

export const locale = writable("en");
export const i18n = derived(locale, ($locale) => (exprKey: string, vars: string[] = []) => {
	if (!exprKey) return 'i18n error no exprkey'
	if (!$locale) return 'i18n error no locale'

	let text = translations.get($locale)?.get(exprKey) ?? ""
	if (!text) return 'i18n error no text'

	vars.map((k, n) => {
		const regex = new RegExp(`{{${n}}}`, "g");
		text = text.replace(regex, k);
	});
	return text
})

export const i18 = (locale: string) => (exprKey: string, vars: string[] = []) => {
	let text = translations.get(locale)?.get(exprKey) ?? ""
	if (!text) return 'i18n error no text'

	vars.map((k, n) => {
		const regex = new RegExp(`{{${n}}}`, "g");
		text = text.replace(regex, k);
	});
	return text
}