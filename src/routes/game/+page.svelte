<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { userInfoStore } from '$lib';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';

	let lobbyName = '';
	let lobbyId = '';

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;

	let players: { UserId: string }[] = [];
	let currentConnections: { UserId: string }[] = [];
	$: isHost = players.length > 0 && $userInfoStore.id === players[0].UserId;

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
	$: tableBorder = game.Playing ? (game.Turn % 2 === 1 ? 'turnBlue' : 'turnOrange') : 'notPlaying';

	let socket: WebSocket;

	let pingpong: NodeJS.Timeout;

	onMount(async () => {
		chat = ['connecting...'];

		socket = new WebSocket(
			`wss://websocket.greatkingdom.net?GameSessionId=${$page.url.searchParams.get('gameId')}`
		);
		socket.addEventListener('open', () => {
			console.log('Opened');
			chat = [...chat, 'connected.'];
		});
		socket.addEventListener('close', (e) => {
			console.log(e);
		});
		socket.addEventListener('error', (e) => {
			console.log(e);
		});
		socket.addEventListener('message', async (e) => {
			const data = JSON.parse(e.data);
			if (data.EventType === 'pong') {
				console.log('pong');
			} else if (data.EventType === 'CHAT') {
				chat = [...chat, data.Chat];
				await tick();
				chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
			} else if (data.EventType === 'GAME') {
				game = data.Game;
			} else if (data.EventType === 'USER') {
				players = data.Players;
				currentConnections = data.CurrentConnections;
				lobbyName = data.GameSessionName;
				lobbyId = data.GameSessionId;
			}
		});

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

	beforeNavigate((e) => {
		if (!confirm('Do you want to leave this game?')) {
			e.cancel();
		}
	});

	let chatInput: string;

	const sendMessage = () => {
		socket.send(JSON.stringify({ action: 'chat', Chat: chatInput }));
		chatInput = '';
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

<h2 class="name">{lobbyName}</h2>
<p>{lobbyId}</p>
<div id="game">
	<table class={tableBorder}>
		{#each game.Board as r, i}
			<tr>
				{#each r as c, j}
					<td
						><button
							class={`cell cellstatus${c}`}
							disabled={!game.Playing ||
								c !== 0 ||
								game.PlayersId[(game.Turn - 1) % 2] !== $userInfoStore.id}
							on:click={() => doSingleMove(i, j)}
						></button></td
					>
				{/each}
			</tr>
		{/each}
	</table>
	<button on:click={doPassMove} disabled={game.PlayersId[(game.Turn - 1) % 2] !== $userInfoStore.id}
		>{game.Playing && game.PassFlag ? 'Opponent Passed' : 'Pass'}</button
	>

	<div class="lobbyinfo">
		<div class="gameInfo">
			<p>Turn {game.Turn}</p>
			{#if game.Turn === 0}
				<p>Game not started.</p>
			{:else}
				<p>{game.PlayersId[(game.Turn - 1) % 2]}</p>
			{/if}
		</div>
		<div bind:this={chatDiv} class="chat">
			{#each chat as c}
				<p class="chatmsg">{c}</p>
			{/each}
		</div>
		<form on:submit|preventDefault={sendMessage}>
			<input type="text" bind:value={chatInput} />
			<button>CHAT</button>
		</form>
		{#if isHost}
			<button on:click={startGame}>start</button>
		{/if}
	</div>

	<div class="users">
		<div class="part">
			<b>Players</b>
			{#if players.length > 0}
				<p
					class={game.Playing ? (players[0].UserId === game.PlayersId[0] ? 'blue' : 'orange') : ''}
				>
					{players[0].UserId}
				</p>
			{:else}
				<p>empty</p>
			{/if}
			{#if players.length > 1}
				<p
					class={game.Playing ? (players[1].UserId === game.PlayersId[1] ? 'orange' : 'blue') : ''}
				>
					{players[1].UserId}
				</p>
			{:else}
				<p>empty</p>
			{/if}
		</div>
		<div class="part">
			<b>Users</b>
			<div>
				{#each currentConnections as c}
					<p>{c.UserId}</p>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.name {
		margin-bottom: 0;
	}

	.lobbyinfo {
		display: flex;
		flex-direction: column;
		width: 20rem;
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
		overflow-y: scroll;
		border: 3px solid black;
		padding: 5px;
		height: 25rem;
	}
	.chat > p {
		overflow-wrap: break-word;
	}

	.user {
		width: 10rem;
		padding: 1rem;
	}
	.part {
		border: 3px solid black;
	}
	.part > b {
		margin: 0;
	}

	.chatmsg {
		margin: 0;
	}

	.blue {
		color: white;
		background-color: blue;
	}
	.orange {
		color: white;
		background-color: orange;
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
