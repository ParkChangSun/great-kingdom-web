<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import { userInfoStore } from '$lib';

	export let data: PageData;

	const { gameId } = data;
	let lobbyName: string = '';

	let socket: WebSocket;

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;

	let hostId = '';
	let players: string[] = [];

	$: isHost = $userInfoStore.id === hostId;

	let board: Number[][] = [];

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
				({ players, hostId, lobbyName } = data);
			} else if (data.event === 2) {
				({ board } = data);
			} else if (data.event === 3) {
				({ board } = data);
			} else {
				console.log('else');
			}
		});
	});

	afterUpdate(() => {
		chatDiv.scroll({ top: chatDiv.scrollHeight });
	});

	onDestroy(() => {
		socket.close();
	});

	let msg: string;

	const sendMessage = () => {
		socket.send(JSON.stringify({ event: 0, chatMessage: msg }));
		msg = '';
	};

	const startGame = () => {
		socket.send(JSON.stringify({ event: 2 }));
	};

	const doSingleMove = (cellStatus: Number, r: Number, c: Number) => {
		if (cellStatus == 0) {
			socket.send(JSON.stringify({ event: 3, point: { r, c } }));
		}
	};

	const doPassMove = () => {
		socket.send(JSON.stringify({ event: 3, pass: true }));
	};
</script>

<p>{lobbyName}</p>
<div id="game">
	<table>
		{#each board as r, i}
			<tr>
				{#each r as c, j}
					<td
						><button class={`cell cellstatus${c}`} on:click={() => doSingleMove(c, i, j)}
							>{c}</button
						></td
					>
				{/each}
			</tr>
		{/each}
	</table>
	<button on:click={doPassMove}>PASS</button>

	<div id="lobbyinfo">
		<p>Players</p>
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
			<button>CHAT</button>
		</form>
		{#if isHost}
			<button on:click={startGame}>start</button>
		{/if}
	</div>
</div>

<style>
	#lobbyinfo {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	#game {
		display: flex;
		gap: 10px;
	}

	.chat {
		overflow: scroll;
		height: 10rem;
		border: 3px solid black;
		padding: 5px;
		flex-grow: 1;
	}

	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	table {
		border-spacing: 5px;
		border: 5px solid black;
	}

	.cell {
		width: 50px;
		height: 50px;
	}
	.cellstatus1 {
		background-color: white;
	}
	.cellstatus2 {
		background-color: blue;
	}
	.cellstatus3 {
		background-color: orange;
	}
	.cellstatus4 {
		background-color: skyblue;
	}
	.cellstatus5 {
		background-color: chocolate;
	}
	.cellstatus6 {
		background-color: red;
	}
</style>
