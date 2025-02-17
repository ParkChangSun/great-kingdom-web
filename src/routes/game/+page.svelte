<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { userInfoStore } from '$lib';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';

	let chat = ['connecting...'];
	let chatDiv: HTMLDivElement;

	type GameLobby = {
		GameLobbyId: string;
		GameLobbyName: string;
		Connections: {
			UserId: string;
		}[];
		Players: string[];
		CoinToss: string[];
		Game: {
			Board: number[][];
			Turn: number;
			PassFlag: boolean;
			Playing: boolean;
		};
	};
	let gameLobby: GameLobby = {
		GameLobbyId: '',
		GameLobbyName: '',
		Connections: [],
		Players: [],
		CoinToss: ['', ''],
		Game: {
			Board: new Array(9).fill(0).map(() => new Array(9).fill(0)),
			Turn: 0,
			PassFlag: false,
			Playing: false
		}
	};

	$: isHost = gameLobby.Players.length > 0 ? gameLobby.Players[0] === $userInfoStore.id : false;
	$: isPlayer = gameLobby.Players.includes($userInfoStore.id);
	$: turnColor = gameLobby.Game.Playing
		? gameLobby.Game.Turn % 2 === 1
			? 'turn-blue'
			: 'turn-orange'
		: 'turn-nobody';
	$: color = gameLobby.Game.Turn % 2 === 1 ? 'blue' : 'orange';

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
			console.log(data);
			if (data.EventType === 'pong') {
				console.log('pong');
			} else if (data.EventType === 'CHAT') {
				chat = [...chat, data.Chat];
				await tick();
				if (chatDiv.scrollTop + chatDiv.clientHeight + 24 >= chatDiv.scrollHeight) {
					chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
				}
			}
			// else if (data.EventType === 'GAME') {
			// 	gameLobby.Game = data.Game;
			// } else if (data.EventType === 'USER') {
			// 	players = data.Players;
			// 	currentConnections = data.CurrentConnections;
			// 	lobbyName = data.GameSessionName;
			// 	lobbyId = data.GameSessionId;
			// }
			else {
				gameLobby = { ...gameLobby, ...data };
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

	const movePlayerSlot = () => {
		socket.send(JSON.stringify({ action: 'slot' }));
	};
	gameLobby.Game?.Board;
</script>

<h2>{gameLobby.GameLobbyId}</h2>
<div class="game">
	<table class={turnColor}>
		{#each gameLobby.Game.Board as r, i}
			<tr>
				{#each r as c, j}
					<td
						><button
							class={`cell cellstatus${c}`}
							disabled={!gameLobby.Game.Playing ||
								c !== 0 ||
								gameLobby.CoinToss[(gameLobby.Game.Turn - 1) % 2] !== $userInfoStore.id}
							on:click={() => doSingleMove(i, j)}
						></button></td
					>
				{/each}
			</tr>
		{/each}
	</table>
	<button
		on:click={doPassMove}
		disabled={!gameLobby.Game.Playing ||
			gameLobby.CoinToss[(gameLobby.Game.Turn - 1) % 2] !== $userInfoStore.id}
	>
		{gameLobby.Game.Playing && gameLobby.Game.PassFlag ? 'Opponent Passed' : 'Pass'}
	</button>

	<div class="info">
		<div class="game-info">
			{#if !gameLobby.Game.Playing}
				<p>Get Ready!</p>
			{:else}
				<p>Turn {gameLobby.Game.Turn}</p>
				<p class={color}>{gameLobby.CoinToss[(gameLobby.Game.Turn - 1) % 2]}</p>
			{/if}
		</div>
		<div bind:this={chatDiv} class="chat-box">
			{#each chat as c}
				<span>{c}</span>
			{/each}
		</div>
		<form on:submit|preventDefault={sendMessage}>
			<input type="text" bind:value={chatInput} />
			<button>CHAT</button>
		</form>
		<button on:click={startGame} disabled={!isHost || gameLobby.Players.length !== 2}>START</button>
		<button on:click={movePlayerSlot}>Move to {isPlayer ? 'spectators' : 'players'} </button>
	</div>

	<div class="user">
		<div class="user-box">
			<b>Players</b>
			{#if gameLobby.Players.length > 0}
				<span>
					👑 {gameLobby.Players[0]}
				</span>
			{:else}
				<span>empty</span>
			{/if}
			{#if gameLobby.Players.length > 1}
				<span>
					🕹️ {gameLobby.Players[1]}
				</span>
			{:else}
				<span>empty</span>
			{/if}
		</div>
		<div class="user-box spec">
			<b>Spectators</b>
			<div>
				{#each gameLobby.Connections as c}
					{#if !gameLobby.Players.some((e) => e === c.UserId)}
						<p>{c.UserId}</p>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.name {
		margin-bottom: 0;
	}

	.info {
		display: flex;
		flex-direction: column;
		width: 20rem;
		gap: 5px;
	}

	.game-info {
		padding: 1rem;
		border: 3px solid black;
	}
	.game-info > p {
		margin: 0;
		text-align: center;
	}

	.game {
		display: flex;
		gap: 10px;
	}

	.chat-box {
		overflow-y: scroll;
		border: 3px solid black;
		padding: 5px;
		height: 25rem;
		display: flex;
		flex-direction: column;
	}

	.user {
		display: flex;
		flex-direction: column;
		width: 10rem;
		gap: 5px;
	}
	.user-box {
		border: 3px solid black;
		padding: 5px;
		display: flex;
		flex-direction: column;
	}
	.spec {
		flex: 1;
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
	.turn-nobody {
		border: 5px solid gray;
	}
	.turn-blue {
		border: 5px solid blue;
	}
	.turn-orange {
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
