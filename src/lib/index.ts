import { derived, get, writable, type Writable } from 'svelte/store';
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

export const unauthorizedApi = axios.create({
	baseURL: REST_URL,
	withCredentials: true
});

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

export class WebSocketManager {
	socket: WebSocket | null = null
	authorized = writable(false)
	pingTimeout!: number

	constructor(
		private url: string,
		private handler: (data: any) => void,
		private onClose: () => void = () => { }
	) { }

	cleanUp() {
		clearInterval(this.pingTimeout);
		if (this.socket) this.socket.close();
	}
	connect() {
		this.socket = new WebSocket(this.url)
		this.socket.addEventListener('open', () => {
			this.send({ action: 'auth', Authorization: get(userInfoStore).AccessToken });
		});
		this.socket.addEventListener('close', (e) => {
			console.log(e);
			this.cleanUp()
			this.onClose()
		});
		this.socket.addEventListener('message', async (e) => {
			const data = JSON.parse(e.data);
			if (data.EventType === 'AUTH') {
				if (data.Auth) {
					this.authorized.set(true)
				} else {
					// ws is closed here by server... or client should do?
					roatateToken()
				}
			} else if (data.EventType === 'PONG') {
				console.log('pong')
			} else {
				this.handler(data)
			}
		});

		this.pingTimeout = setInterval(() => {
			this.send({ action: 'ping' });
		}, 540000);
	}
	send(p: any) {
		if (this.socket) this.socket.send(JSON.stringify(p));
	}
	isClosed() {
		return this.socket && (this.socket.readyState === this.socket.CLOSING || this.socket.readyState === this.socket.CLOSED)
	}
	getAuthorized() {
		return this.authorized
	}
}
