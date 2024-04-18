<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import { userInfoStore } from '$lib';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const { gameId } = data;
	let lobbyName: string = '';

	let socket: WebSocket;

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;

	let hostId = '';
	let players: { UserId: string }[] = [];

	$: isHost = $userInfoStore.id === players[0].UserId;

	type Game = {
		Borad: number[][];
		Turn: number;
		PassFlag: boolean;
		Playing: boolean;
		PlayersId: string[];
	};
	let game: Game;

	onMount(async () => {
		socket = new WebSocket(
			`wss://omlo79fwk8.execute-api.us-east-1.amazonaws.com/Dev/?GameSessionId=${gameId}`
		);
		socket.addEventListener('open', () => {
			console.log('Opened');
		});
		socket.addEventListener('close', (e) => {
			console.log(e);
			goto('/lobby');
		});
		socket.addEventListener('error', (e) => {
			console.log(e);
		});
		socket.addEventListener('message', (e) => {
			const data = JSON.parse(e.data);
			console.log(data);
			if (data.EventType === 'JOIN') {
				chat = [...chat, data.Chat];
				players = data.Players;
				game = data.Game;
			} else if (data.EventType === 'CHAT') {
				chat = [...chat, data.Chat];
			} else if (data.EventType === 'GAME') {
				game = data.Game;
				chat = [...chat, data.Chat];
			} else if (data.EventType === 'LEAVE') {
				chat = [...chat, data.Chat];
				players = data.Players;
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
		socket.send(JSON.stringify({ action: 'chat', Chat: msg }));
		msg = '';
	};

	const startGame = () => {
		socket.send(JSON.stringify({ action: 'game', Start: true }));
	};

	const doSingleMove = (r: Number, c: Number) => {
		socket.send(JSON.stringify({ action: 'game', Point: { r, c } }));
	};

	const doPassMove = () => {
		socket.send(JSON.stringify({ action: 'game', Pass: true }));
	};
</script>

<p>{lobbyName}</p>
<div id="game">
	<table>
		{#each game.Borad as r, i}
			<tr>
				{#each r as c, j}
					<td
						><button
							class={`cell cellstatus${c}`}
							disabled={c !== 0}
							on:click={() => doSingleMove(i, j)}>{c}</button
						></td
					>
				{/each}
			</tr>
		{/each}
	</table>
	<button on:click={doPassMove}>PASS</button>

	<div id="lobbyinfo">
		<p>Players</p>
		{#if players.length > 0}
			<div class="player">{players[0].UserId}</div>
		{:else}
			<div class="player">empty</div>
		{/if}
		{#if players.length > 1}
			<div class="player">{players[1].UserId}</div>
		{:else}
			<div class="player">empty</div>
		{/if}
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

<p>playing {game.Playing}</p>
<p class={game.Turn % 2 === 1 ? 'turnBlue' : 'turnOrange'}>
	turn {game.Turn} passflag {game.PassFlag}
</p>
<p>player1 {game.PlayersId[0]} player2 {game.PlayersId[1]}</p>

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

	.turnBlue {
		background-color: blue;
	}
	.turnOrange {
		background-color: orange;
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
