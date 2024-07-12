<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { API_URL, locale, refreshToken, userInfoStore } from '$lib';
	import { onDestroy, onMount, tick } from 'svelte';

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;
	$: if (chat && chatDiv) {
		chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
	}
	const addChat = (msg: string) => {
		chat = [...chat, msg];
	};

	let lastScroll: number;
	let scrollLoading = false;

	let socket: WebSocket;
	const connectSocket = () => {
		socket = new WebSocket(`wss://websocket.greatkingdom.net?GameSessionId=globalchat`);
		socket.addEventListener('open', () => {
			console.log('Opened');
			addChat('connected.');
		});
		socket.addEventListener('close', (e) => {
			console.log(e);
		});
		socket.addEventListener('error', (e) => {
			console.log(e);
			refreshToken();
			addChat('refreshing...');
		});
		socket.addEventListener('message', async (e) => {
			type Data = {
				EventType: string;
				Messages: { Chat: string }[];
				Chat: string;
				LastScroll: number;
			};
			const data: Data = JSON.parse(e.data);
			if (data.EventType === 'pong') {
				console.log('pong');
			} else if (data.EventType === 'lastchat') {
				lastScroll = data.LastScroll;
				data.Messages.reverse().forEach((e) => {
					chat = [...chat, e.Chat];
				});
				await tick();
				chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
			} else if (data.EventType === 'scroll') {
				lastScroll = data.LastScroll;
				data.Messages.forEach((e) => {
					chat = [e.Chat, ...chat];
				});
				scrollLoading = false;
			} else {
				chat = [...chat, data.Chat];
				await tick();
				if (chatDiv.scrollTop + chatDiv.clientHeight + 24 >= chatDiv.scrollHeight) {
					chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
				}
			}
		});
	};

	$: if (browser) {
		if ($userInfoStore.authorized) {
			addChat('connecting...');
			connectSocket();
		} else {
			goto(`/user${$locale === 'en' ? '' : `?lang=${$locale}`}`);
		}
	}

	let chatInput: string;
	const sendChat = async () => {
		socket.send(JSON.stringify({ action: 'globalchat', Chat: chatInput }));
		chatInput = '';
	};

	let pingpong: NodeJS.Timeout;
	onMount(() => {
		pingpong = setInterval(() => {
			if (socket) {
				socket.send(JSON.stringify({ action: 'ping' }));
			}
		}, 300000);
		chatDiv.addEventListener('scrollend', (e) => {
			if (chatDiv.scrollTop === 0 && lastScroll !== 0 && !scrollLoading) {
				socket.send(JSON.stringify({ action: 'scroll', LastScroll: lastScroll }));
				scrollLoading = true;
			}
		});
	});

	onDestroy(() => {
		clearInterval(pingpong);
		if (socket) {
			socket.close();
		}
	});
</script>

<div bind:this={chatDiv} class="chat">
	{#each chat as c}
		<p>{c}</p>
	{/each}
</div>
<form on:submit|preventDefault={sendChat}>
	<input bind:value={chatInput} /><button type="submit">Chat</button>
</form>

<style>
	div {
		height: 30rem;
		width: 100%;
		border: 1px solid black;
		overflow-y: scroll;
	}

	p {
		margin: 0;
	}
</style>
