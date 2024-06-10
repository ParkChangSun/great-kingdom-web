<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_URL, refreshToken, userInfoStore } from '$lib';
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
			const data = JSON.parse(e.data);
			chat = [...chat, data.Chat];
		});
	};

	$: if ($userInfoStore.authorized) {
		addChat('connecting...');
		connectSocket();
	} else {
		goto('/user');
	}

	onDestroy(() => {
		if (socket) {
			socket.close();
		}
	});

	let chatInput: string;
	const sendChat = async () => {
		socket.send(JSON.stringify({ action: 'globalchat', Chat: chatInput }));
		chatInput = '';
	};
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
