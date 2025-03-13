import { derived, get, writable, type Writable } from 'svelte/store';
import translations from './translation'
import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';
import { browser } from '$app/environment';

export const REST_URL = 'https://api.greatkingdom.net'
export const WS_URL = 'wss://websocket.greatkingdom.net'

function persistentStore<T>(key: string, initialValue: T) {
	const storedValue = browser && localStorage.getItem(key);
	const store = writable<T>(storedValue ? JSON.parse(storedValue) : initialValue);

	store.subscribe(value => {
		browser && localStorage.setItem(key, JSON.stringify(value));
	});

	return store;
}

export type Authorization = {
	Authorized: boolean;
	Id: string;
	AccessToken: string
};

export const userInfoStore = persistentStore<Authorization>("USERINFO", { Authorized: false, Id: '', AccessToken: "" })

const authorizedApi = axios.create({
	baseURL: REST_URL,
	withCredentials: true
});
authorizedApi.interceptors.request.use(
	(config) => {
		config.headers.Authorization = get(userInfoStore).AccessToken;
		return config;
	},
	(error) => Promise.reject(error)
);
authorizedApi.interceptors.response.use(
	(res) => res,
	async (error) => {
		if (isAxiosError(error) && error.config) {
			const repeatReq: AxiosRequestConfig & { _retry: boolean } = { _retry: false, ...error.config, };
			if (error.response && error.response.status === 403 && !repeatReq._retry) {
				repeatReq._retry = true

				const auth = await roatateToken()
				if (auth.Authorized) {
					repeatReq.headers!["Authorization"] = auth.AccessToken
					return authorizedApi(repeatReq);
				}
				// try {
				// 	const auth = await roatateToken()
				// 	userInfoStore.set(auth)
				// 	if (auth.Authorized) {
				// 		repeatReq.headers!["Authorization"] = auth.AccessToken
				// 		return authorizedApi(repeatReq);
				// 	}
				// } catch (error) {
				// 	userInfoStore.set({ Authorized: false, AccessToken: "", Id: "" })
				// 	return Promise.reject(error);
				// }
			}
		}
		return Promise.reject(error);
	}
);

export { authorizedApi }

let rotateTokenPromise: Promise<Authorization> | null = null

const roatateToken = async () => {
	if (rotateTokenPromise) {
		return rotateTokenPromise
	}

	rotateTokenPromise = (async () => {
		try {
			const res = await authorizedApi.post<Authorization>('/rotate-token');
			userInfoStore.set(res.data)
			return res.data
		} catch (error) {
			userInfoStore.set({ Authorized: false, AccessToken: "", Id: "" })
			return { Authorized: false, AccessToken: "", Id: "" }
		} finally {
			rotateTokenPromise = null
		}
	})()
	return rotateTokenPromise
}

export const connectWebSocket = (url: string, handler: (data: any) => void): [WebSocket, Writable<boolean>, () => void] => {
	const socket = new WebSocket(url)
	let ping = setInterval(() => {
		if (socket) {
			socket.send(JSON.stringify({ action: 'ping' }));
		}
	}, 540000);

	const cleanUp = () => {
		clearInterval(ping);
		socket.close();
	}
	const authorized = writable(false)

	socket.addEventListener('open', () => {
		socket.send(JSON.stringify({ action: 'auth', Authorization: get(userInfoStore).AccessToken }));
	});
	socket.addEventListener('close', (e) => {
		console.log(e);
		cleanUp()
	});
	// socket.addEventListener('error', (e) => {
	// 	console.log(e);
	// 	cleanUp()
	// });
	socket.addEventListener('message', async (e) => {
		const data = JSON.parse(e.data);
		if (data.EventType === 'AUTH') {
			if (data.Auth) {
				authorized.set(true)
			} else {
				// cleanUp()
				roatateToken()
				// try {
				// 	const auth = await roatateToken()
				// 	userInfoStore.set(auth)
				// } catch (error) {
				// 	userInfoStore.set({ Authorized: false, AccessToken: "", Id: "" })
				// }
			}
		} else if (data.EventType === 'PONG') {
			console.log('pong')
		}

		handler(data)
	});

	return [socket, authorized, cleanUp]
}

export const unauthorizedApi = axios.create({
	baseURL: REST_URL,
	withCredentials: true
});

// export const locale = writable("en");
// export const i18n = derived(locale, ($locale) => (exprKey: string, vars: string[] = []) => {
// 	if (!exprKey) return 'i18n error no exprkey'
// 	if (!$locale) return 'i18n error no locale'

// 	let text = translations.get($locale)?.get(exprKey) ?? ""
// 	if (!text) return 'i18n error no text'

// 	vars.map((k, n) => {
// 		const regex = new RegExp(`{{${n}}}`, "g");
// 		text = text.replace(regex, k);
// 	});
// 	return text
// })

// export const i18 = (locale: string) => (exprKey: string, vars: string[] = []) => {
// 	let text = translations.get(locale)?.get(exprKey) ?? ""
// 	if (!text) return 'i18n error no text'

// 	vars.map((k, n) => {
// 		const regex = new RegExp(`{{${n}}}`, "g");
// 		text = text.replace(regex, k);
// 	});
// 	return text
// }