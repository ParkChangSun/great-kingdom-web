<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import { userInfoStore } from '$lib';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';

	let lobbyName: string = '';

	let socket: WebSocket;

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;

	let players: { UserId: string }[] = [];
	let currentConnections: { UserId: string }[] = [];

	$: isHost = players.length > 0 && $userInfoStore.id === players[0].UserId;
	$: tableBorder = game.Playing ? (game.Turn % 2 === 1 ? 'turnBlue' : 'turnOrange') : 'notPlaying';

	type Game = {
		Board: number[][];
		Turn: number;
		PassFlag: boolean;
		Playing: boolean;
		PlayersId: string[];
	};
	let game: Game = {
		Board: Array.from(Array(9), (v, i) => Array(0, 0, 0, 0, 0, 0, 0, 0, 0)),
		Turn: 0,
		PassFlag: false,
		Playing: false,
		PlayersId: ['p1', 'p2']
	};

	onMount(async () => {
		socket = new WebSocket(
			`wss://websocket.greatkingdom.net?GameSessionId=${$page.url.searchParams.get('gameId')}`
		);
		socket.addEventListener('open', () => {
			console.log('Opened');
		});
		socket.addEventListener('close', (e) => {
			console.log(e);
			// goto('/lobby');
		});
		socket.addEventListener('error', (e) => {
			console.log(e);
		});
		socket.addEventListener('message', (e) => {
			const data = JSON.parse(e.data);
			if (data.EventType === 'CHAT') {
				chat = [...chat, data.Chat];
			} else if (data.EventType === 'GAME') {
				game = data.Game;
			} else if (data.EventType === 'USER') {
				players = data.Players;
				currentConnections = data.CurrentConnections;
			}
		});
	});

	afterUpdate(() => {
		chatDiv.scroll({ top: chatDiv.scrollHeight });
	});

	onDestroy(() => {
		socket.close();
	});

	beforeNavigate((e) => {
		if (socket && !confirm('Do you want to leave this game?')) {
			e.cancel();
		}
	});

	let msg: string;

	const sendMessage = () => {
		socket.send(JSON.stringify({ action: 'chat', Chat: msg }));
		msg = '';
	};

	const startGame = () => {
		socket.send(JSON.stringify({ action: 'move', Start: true }));
	};

	const doSingleMove = (r: Number, c: Number) => {
		socket.send(JSON.stringify({ action: 'move', Point: { R: r, C: c } }));
	};

	const doPassMove = () => {
		socket.send(JSON.stringify({ action: 'move', Pass: true }));
	};
</script>

<p>{lobbyName}</p>
<div id="game">
	<table class={tableBorder}>
		{#each game.Board as r, i}
			<tr>
				{#each r as c, j}
					<td
						><button
							class={`cell cellstatus${c}`}
							disabled={c !== 0 || game.PlayersId[(game.Turn - 1) % 2] !== $userInfoStore.id}
							on:click={() => doSingleMove(i, j)}>{c}</button
						></td
					>
				{/each}
			</tr>
		{/each}
	</table>
	<button on:click={doPassMove}>{game.PassFlag ? 'Opponent Passed' : 'Pass'}</button>

	<div id="lobbyinfo">
		<div class="gameInfo">
			<p>Turn {game.Turn}</p>
			{#if game.Turn === 0}
				<p>Game not started.</p>
			{:else}
				<p>{players[(game.Turn - 1) % 2].UserId}</p>
			{/if}
		</div>
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

	<div>
		<p>Players</p>
		{#if players.length > 0}
			<p class={game.Playing ? (players[0].UserId === game.PlayersId[0] ? 'blue' : 'orange') : ''}>
				{players[0].UserId}
			</p>
		{:else}
			<p>empty</p>
		{/if}
		{#if players.length > 1}
			<p class={game.Playing ? (players[1].UserId === game.PlayersId[1] ? 'orange' : 'blue') : ''}>
				{players[1].UserId}
			</p>
		{:else}
			<div>empty</div>
		{/if}
		<p>Users</p>
		<div class="users">
			{#each currentConnections as c}
				<p>{c.UserId}</p>
			{/each}
		</div>
	</div>
</div>

<style>
	#lobbyinfo {
		display: flex;
		flex-direction: column;
	}

	.gameInfo {
		padding: 1rem;
		border: 3px solid black;
	}
	.gameInfo > p {
		margin: 0;
		text-align: center;
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

	.blue {
		color: blue;
	}
	.orange {
		color: orange;
	}

	table {
		border-spacing: 5px;
	}
	.notPlaying {
		border: 5px solid gray;
	}
	.turnBlue {
		border: 5px solid blue;
	}
	.turnOrange {
		border: 5px solid orange;
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
