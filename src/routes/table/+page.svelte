<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { connectWebSocket, userInfoStore, WS_URL } from '$lib';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { writable, type Writable } from 'svelte/store';
	import { browser, building } from '$app/environment';

	type GameTable = {
		GameTableId: string;
		GameTableName: string;
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
		RemainingTime: number[];
	};
	let table: GameTable = {
		GameTableId: '',
		GameTableName: '',
		Connections: [],
		Players: [],
		CoinToss: ['', ''],
		Game: {
			Board: new Array(9).fill(0).map(() => new Array(9).fill(0)),
			Turn: 0,
			PassFlag: false,
			Playing: false
		},
		RemainingTime: []
	};

	$: isHost = table.Players.length > 0 ? table.Players[0] === $userInfoStore.Id : false;
	$: isPlayer = table.Players.includes($userInfoStore.Id);
	$: isMyTurn = table.CoinToss[(table.Game.Turn - 1) % 2] === $userInfoStore.Id;

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;
	let chatInput: string;
	const sendMessage = () => {
		socket.send(JSON.stringify({ action: 'chat', Chat: chatInput }));
		chatInput = '';
	};

	let kickable = false;

	let blueTimer: NodeJS.Timeout;
	let blueTime: number;
	let orangeTimer: NodeJS.Timeout;
	let orangeTime: number;

	const handler = (data: any) => {
		if (data.EventType === 'CHAT') {
			chat = [...chat, data.Chat];
			tick().then(() => chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' }));
		} else if (data.EventType === 'TABLE') {
			kickable = false;
			table = { ...table, ...data };

			clearInterval(blueTimer);
			clearInterval(orangeTimer);

			if (table.Game.Playing) {
				blueTime = table.RemainingTime[0];
				orangeTime = table.RemainingTime[1];

				if (table.Game.Turn % 2 === 1) {
					blueTimer = setInterval(() => {
						blueTime -= 1000;
						if (blueTime <= 0) {
							kickable = true;
							clearInterval(blueTimer);
						}
					}, 1000);
				} else {
					orangeTimer = setInterval(() => {
						orangeTime -= 1000;
						if (orangeTime <= 0) {
							kickable = true;
							clearInterval(orangeTimer);
						}
					}, 1000);
				}
			}
		} else {
			console.log(data);
		}
	};

	let socket: WebSocket;
	let authorized: Writable<boolean>;
	let cleanUp = () => {};

	const unsub = userInfoStore.subscribe(async (v) => {
		cleanUp();
		if (!v.Authorized) {
			browser && goto('/lobby');
		}

		[socket, authorized, cleanUp] = connectWebSocket(
			`${WS_URL}?GameTableId=${!building ? $page.url.searchParams.get('tableId') : ''}`,
			handler
		);
	});

	onDestroy(() => {
		cleanUp();
		unsub();
	});

	beforeNavigate((e) => {
		if (socket.readyState === socket.CLOSING || socket.readyState === socket.CLOSED) {
			return;
		}
		if (!confirm('Do you want to leave this game?')) {
			e.cancel();
		}
	});

	const startGame = () => {
		socket.send(JSON.stringify({ action: 'table', EventType: 2 }));
	};
	const doSingleMove = (r: Number, c: Number) => {
		socket.send(JSON.stringify({ action: 'table', EventType: 3, Move: { R: r, C: c } }));
	};
	const doPassMove = () => {
		socket.send(JSON.stringify({ action: 'table', EventType: 3, Pass: true }));
	};
	const surrender = () => {
		socket.send(JSON.stringify({ action: 'table', EventType: 3, Surrender: true }));
	};
	const movePlayerSlot = () => {
		socket.send(JSON.stringify({ action: 'table', EventType: 4 }));
	};
	const kick = () => {
		socket.send(JSON.stringify({ action: 'table', EventType: 5 }));
	};
</script>

<div class="table">
	<div class="board">
		{#each table.Game.Board as row, r}
			{#each row as cell, c}
				<button
					class={`cell cellstatus${cell}`}
					disabled={!table.Game.Playing || cell !== 0 || !isMyTurn}
					on:click={() => doSingleMove(r, c)}
				></button>
			{/each}
		{/each}
	</div>

	<div class="buttons">
		<button on:click={doPassMove} disabled={!table.Game.Playing || !isMyTurn} class="game-btn">
			{table.Game.Playing && table.Game.PassFlag ? 'Count' : 'Pass'}
		</button>
		<button on:click={surrender} disabled={!table.Game.Playing || !isMyTurn} class="game-btn"
			>Surrender</button
		>
	</div>

	<div class="section info-chat-section">
		<div class="box">
			{#if !table.Game.Playing}
				<p class="info-head">{table.GameTableName}</p>
			{:else}
				<p class="info-head">Turn {table.Game.Turn}</p>
				<span class={`${table.Game.Turn % 2 === 1 ? 'blue' : ''} turn-count`}>
					<span>{table.CoinToss[0]}</span>
					<span>
						{Math.floor(blueTime / 60000)}:{String(Math.floor((blueTime % 60000) / 1000)).padStart(
							2,
							'0'
						)}
					</span>
				</span>
				<span class={`${table.Game.Turn % 2 !== 1 ? 'orange' : ''} turn-count`}>
					<span>{table.CoinToss[1]}</span>
					<span>
						{Math.floor(orangeTime / 60000)}:{String(
							Math.floor((orangeTime % 60000) / 1000)
						).padStart(2, '0')}
					</span>
				</span>
			{/if}
		</div>
		<div bind:this={chatDiv} class="box chat-box">
			{#each chat as c}
				<span>{c}</span>
			{/each}
		</div>
		<div class="chat-input">
			<input type="text" bind:value={chatInput} disabled={!$authorized} />
			<button on:click={sendMessage}>CHAT</button>
		</div>
		{#if kickable}
			<button on:click={kick} disabled={!isPlayer || !table.Game.Playing}>KICK AFK</button>
		{:else}
			<button
				on:click={startGame}
				disabled={!isHost || table.Players.length !== 2 || table.Game.Playing}>START</button
			>
		{/if}
		<button on:click={movePlayerSlot}>Move to {isPlayer ? 'spectators' : 'players'} </button>
	</div>

	<div class="section user-section">
		<div class="box">
			<b>Players</b>
			{#if table.Players.length > 0}
				<span>
					👑 {table.Players[0]}
				</span>
			{:else}
				<span>empty</span>
			{/if}
			{#if table.Players.length > 1}
				<span>
					🕹️ {table.Players[1]}
				</span>
			{:else}
				<span>empty</span>
			{/if}
		</div>
		<div class="box spectators">
			<b>Spectators</b>
			<div>
				{#each table.Connections as c}
					{#if !table.Players.some((e) => e === c.UserId)}
						<span>{c.UserId}</span>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	{#if !$authorized}
		<div class="popup-container">connecting...</div>
	{/if}
</div>

<style>
	.table {
		display: flex;
		gap: 10px;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(9, 1fr);
		grid-template-rows: repeat(9, 1fr);
		gap: 5px;
		border: 5px solid gray;
		padding: 10px;
	}
	.cell {
		width: 50px;
		height: 50px;
	}
	.cellstatus1 {
		background-color: white;
	}
	.cellstatus2 {
		background-color: skyblue;
	}
	.cellstatus3 {
		background-color: orange;
	}
	.cellstatus4 {
		background-color: blue;
	}
	.cellstatus5 {
		background-color: chocolate;
	}
	.cellstatus6 {
		background-color: red;
	}
	.buttons {
		display: flex;
		flex-direction: column;
	}
	.game-btn {
		flex-grow: 1;
	}

	.box {
		border: 3px solid black;
		padding: 5px;
		display: flex;
		flex-direction: column;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.info-chat-section {
		width: 16rem;
	}
	.info-head {
		margin: 0;
		text-align: center;
	}
	.turn-count {
		display: flex;
		justify-content: space-between;
	}
	.blue {
		color: white;
		background-color: blue;
	}
	.orange {
		color: white;
		background-color: orange;
	}

	.chat-box {
		overflow-y: scroll;
		height: 25rem;
	}
	.chat-input {
		display: flex;
	}
	.chat-input > input {
		flex-grow: 1;
	}

	.user-section {
		width: 10rem;
	}
	.spectators {
		flex: 1;
	}

	.popup-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		border-radius: 10px;
		z-index: 1000;
	}
</style>
