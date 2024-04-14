import { writable } from 'svelte/store';

// initvalue localstorage?
export const userInfoStore = writable({ id: '' });
