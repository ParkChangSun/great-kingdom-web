<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { authorizedApi, connectWebSocket, userInfoStore, WS_URL, type Authorization } from '$lib';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Writable } from 'svelte/store';
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
	};
	let defaultTable: GameTable = {
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
		}
	};

	$: isHost =
		defaultTable.Players.length > 0 ? defaultTable.Players[0] === $userInfoStore.Id : false;
	$: isPlayer = defaultTable.Players.includes($userInfoStore.Id);
	$: turnColor = defaultTable.Game.Playing
		? defaultTable.Game.Turn % 2 === 1
			? 'turn-blue'
			: 'turn-orange'
		: 'turn-nobody';
	$: color = defaultTable.Game.Turn % 2 === 1 ? 'blue' : 'orange';

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;
	let chatInput: string;

	const handler = (data: any) => {
		if (data.EventType === 'CHAT') {
			chat = [...chat, data.Chat];
		} else if (data.EventType === 'TABLE') {
			defaultTable = { ...defaultTable, ...data };
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
		if (!confirm('Do you want to leave this game?')) {
			e.cancel();
		}
	});

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
</script>

<div class="game">
	<table class={turnColor}>
		{#each defaultTable.Game.Board as r, i}
			<tr>
				{#each r as c, j}
					<td
						><button
							class={`cell cellstatus${c}`}
							disabled={!defaultTable.Game.Playing ||
								c !== 0 ||
								defaultTable.CoinToss[(defaultTable.Game.Turn - 1) % 2] !== $userInfoStore.Id}
							on:click={() => doSingleMove(i, j)}
						></button></td
					>
				{/each}
			</tr>
		{/each}
	</table>
	<button
		on:click={doPassMove}
		disabled={!defaultTable.Game.Playing ||
			defaultTable.CoinToss[(defaultTable.Game.Turn - 1) % 2] !== $userInfoStore.Id}
	>
		{defaultTable.Game.Playing && defaultTable.Game.PassFlag ? 'Opponent Passed' : 'Pass'}
	</button>

	<div class="info">
		<div class="game-info">
			<p><b>Table </b>{defaultTable.GameTableName}</p>
			{#if !defaultTable.Game.Playing}
				<p>Get Ready!</p>
			{:else}
				<p>Turn {defaultTable.Game.Turn}</p>
				<p class={color}>{defaultTable.CoinToss[(defaultTable.Game.Turn - 1) % 2]}</p>
			{/if}
		</div>
		<div bind:this={chatDiv} class="chat-box">
			{#each chat as c}
				<span>{c}</span>
			{/each}
		</div>
		<form on:submit|preventDefault={sendMessage}>
			<input type="text" bind:value={chatInput} disabled={!$authorized} />
			<button>CHAT</button>
		</form>
		<button on:click={startGame} disabled={!isHost || defaultTable.Players.length !== 2}
			>START</button
		>
		<button on:click={movePlayerSlot}>Move to {isPlayer ? 'spectators' : 'players'} </button>
	</div>

	<div class="user">
		<div class="user-box">
			<b>Players</b>
			{#if defaultTable.Players.length > 0}
				<span>
					👑 {defaultTable.Players[0]}
				</span>
			{:else}
				<span>empty</span>
			{/if}
			{#if defaultTable.Players.length > 1}
				<span>
					🕹️ {defaultTable.Players[1]}
				</span>
			{:else}
				<span>empty</span>
			{/if}
		</div>
		<div class="user-box spec">
			<b>Spectators</b>
			<div>
				{#each defaultTable.Connections as c}
					{#if !defaultTable.Players.some((e) => e === c.UserId)}
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
