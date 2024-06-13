<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_URL, refreshToken, userInfoStore } from '$lib';
	import { time } from 'console';
	import { onDestroy, onMount } from 'svelte';

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;
	$: if (chat && chatDiv) {
		chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
	}
	const addChat = (msg: string) => {
		chat = [...chat, msg];
	};

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
		socket.addEventListener('message', (e) => {
			type Data = {
				EventType: string;
				Messages: { Chat: string }[];
				Chat: string;
			};
			const data: Data = JSON.parse(e.data);
			if (data.EventType === 'pong') {
				console.log('pong');
			} else if (data.EventType === 'lastchat') {
				data.Messages.forEach((e) => {
					chat = [...chat, e.Chat];
				});
			} else {
				chat = [...chat, data.Chat];
			}
		});
	};

	$: if ($userInfoStore.authorized) {
		addChat('connecting...');
		connectSocket();
	} else {
		goto('/user');
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
