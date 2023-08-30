import { writable } from 'svelte/store';

type Lobby = {
	id: string;
	name: string;
	createdBy: string;
	isLocked: boolean;
	playersNum: number;
};

let initLobby: Lobby[] = [];
export const lobbyStore = writable(initLobby);

// initvalue localstorage?
export const userInfoStore = writable({ id: '' });
