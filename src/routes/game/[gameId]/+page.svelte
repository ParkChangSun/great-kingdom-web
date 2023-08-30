<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import { userInfoStore } from '$lib';

	export let data: PageData;

	const { gameId } = data;

	let socket: WebSocket;

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;

	let hostId = '';
	let players: string[] = [];

	$: isHost = $userInfoStore.id === hostId;

	onMount(async () => {
		socket = new WebSocket(`ws://localhost:8000/game/${gameId}`);
		socket.addEventListener('open', () => {
			console.log('Opened');
		});
		socket.addEventListener('close', (e) => {
			console.log(e);
		});
		socket.addEventListener('error', (e) => {
			console.log(e);
		});
		socket.addEventListener('message', (e) => {
			const data = JSON.parse(e.data);
			if (data.event === 0) {
				chat = [...chat, data.chatMessage];
			} else if (data.event === 1) {
				({ players, hostId } = data);
				console.log(players);
			} else {
				console.log('else');
			}
		});
	});

	afterUpdate(() => {
		chatDiv.scroll({ top: chatDiv.scrollHeight });
	});

	let msg: string;

	const sendMessage = () => {
		socket.send(JSON.stringify({ event: 0, chatMessage: msg }));
		msg = '';
	};

	onDestroy(() => {
		socket.close();
	});

	const startGame = () => {
		socket.send(JSON.stringify({ event: 2 }));
	};
</script>

<p>{gameId}</p>
{#each players as p}
	<div class="player">
		{#if p !== ''}
			{p}
		{:else}
			empty
		{/if}
		{#if hostId == p}
			👑
		{/if}
	</div>
{/each}
<div bind:this={chatDiv} class="chat">
	<ul>
		{#each chat as c}
			<li>{c}</li>
		{/each}
	</ul>
</div>
<form on:submit|preventDefault={sendMessage}>
	<input type="text" bind:value={msg} />
	<button>send</button>
</form>
{#if isHost}
	<button on:click={startGame}>start</button>
{/if}

<style>
	.chat {
		overflow: scroll;
		height: 10rem;
		border: 3px solid black;
		padding: 5px;
	}

	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}
</style>
