<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { userInfoStore, WebSocketManager, WS_URL } from '$lib';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser, building } from '$app/environment';

	type GameTable = {
		GameTableId: string;
		GameTableName: string;
		Connections: {
			UserId: string;
		}[];
		Players: string[];
		Game: {
			CoinToss: string[];
			Board: number[][];
			Turn: number;
			PassFlag: boolean;
			Playing: boolean;
			RemainingTime: number[];
			LastMoveTime: number;
			LastMove: { R: number; C: number } | null;
		};
	};
	let table: GameTable = {
		GameTableId: '',
		GameTableName: '',
		Connections: [],
		Players: [],
		Game: {
			CoinToss: ['', ''],
			Board: new Array(9).fill(0).map(() => new Array(9).fill(0)),
			Turn: 0,
			PassFlag: false,
			Playing: false,
			RemainingTime: [0, 0],
			LastMoveTime: 0,
			LastMove: null
		}
	};

	$: isHost = table.Players.length > 0 ? table.Players[0] === $userInfoStore.Id : false;
	$: isPlayer = table.Players.includes($userInfoStore.Id);
	$: isMyTurn = table.Game.CoinToss[(table.Game.Turn - 1) % 2] === $userInfoStore.Id;

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;
	let chatInput: string;

	let kickable = false;
	let blueTime: number = 0;
	let orangeTime: number = 0;
	let timer: NodeJS.Timeout;

	const handler = (data: any) => {
		if (data.EventType === 'CHAT') {
			chat = [...chat, data.Chat];
			tick().then(() => {
				const { scrollTop, scrollHeight, clientHeight } = chatDiv;
				if (scrollTop + clientHeight >= scrollHeight - 50)
					chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
			});
		} else if (data.EventType === 'TABLE') {
			table = { ...table, ...data };

			kickable = false;
			clearInterval(timer);

			if (table.Game.Playing) {
				blueTime = table.Game.RemainingTime[0];
				orangeTime = table.Game.RemainingTime[1];

				timer = setInterval(() => {
					if (table.Game.Turn % 2 === 1) {
						blueTime = table.Game.RemainingTime[0] - (Date.now() - table.Game.LastMoveTime);
					} else {
						orangeTime = table.Game.RemainingTime[1] - (Date.now() - table.Game.LastMoveTime);
					}
					if (blueTime <= 0 || orangeTime <= 0) {
						kickable = true;
						clearInterval(timer);
					}
				}, 1000);
			}
		} else {
			console.log(data);
		}
	};

	const wsm = new WebSocketManager(
		`${WS_URL}?GameTableId=${!building ? $page.url.searchParams.get('tableId') : ''}`,
		handler
	);
	let wsAuthed = wsm.getAuthorized();
	const unsub = userInfoStore.subscribe(async (v) => {
		if (!v.Authorized) {
			browser && goto('/lobby');
			return;
		}

		wsm.connect();
	});

	onDestroy(() => {
		wsm.cleanUp();
		unsub();
	});

	beforeNavigate((e) => {
		if (wsm.isClosed()) {
			return;
		}
		if (!confirm('Do you want to leave this game?')) {
			e.cancel();
		}
	});

	const sendMessage = () => {
		wsm.send({ action: 'chat', Chat: chatInput });
		chatInput = '';
	};
	const startGame = () => {
		wsm.send({ action: 'table', EventType: 2 });
	};
	const doSingleMove = (r: Number, c: Number) => {
		wsm.send({ action: 'table', EventType: 3, Move: { R: r, C: c } });
	};
	const doPassMove = () => {
		wsm.send({ action: 'table', EventType: 3, Pass: true });
	};
	const resign = () => {
		wsm.send({ action: 'table', EventType: 3, Resign: true });
	};
	const movePlayerSlot = () => {
		wsm.send({ action: 'table', EventType: 4 });
	};
	const kick = () => {
		wsm.send({ action: 'table', EventType: 5 });
	};
	const leave = () => {
		goto('/lobby');
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
				>
					{#if table.Game.LastMove && table.Game.LastMove.R === r && table.Game.LastMove.C === c}
						<div class="last-move"></div>
					{/if}
				</button>
			{/each}
		{/each}
	</div>

	<div class="section">
		<button
			on:click={doPassMove}
			disabled={!table.Game.Playing || !isMyTurn}
			class={`game-btn ${table.Game.PassFlag ? 'passed' : ''}`}
		>
			{table.Game.Playing && table.Game.PassFlag ? 'Count' : 'Pass'}
		</button>
		<button on:click={resign} disabled={!table.Game.Playing || !isMyTurn} class="game-btn">
			Resign
		</button>
	</div>

	<div class="section info-chat-section">
		<div class="box">
			<p class="info-head">{table.GameTableName}</p>
			<p class="info-head">Turn {table.Game.Turn}</p>
			<span
				class={`${table.Game.Playing && table.Game.Turn % 2 === 1 ? 'blue' : ''} blue-border turn-count`}
			>
				<span>{table.Game.CoinToss[0]}</span>
				<span>
					{Math.floor(blueTime / 60000)}:{String(Math.floor((blueTime % 60000) / 1000)).padStart(
						2,
						'0'
					)}
				</span>
			</span>
			<span
				class={`${table.Game.Playing && table.Game.Turn % 2 !== 1 ? 'orange' : ''} orange-border turn-count`}
			>
				<span>{table.Game.CoinToss[1]}</span>
				<span>
					{Math.floor(orangeTime / 60000)}:{String(
						Math.floor((orangeTime % 60000) / 1000)
					).padStart(2, '0')}
				</span>
			</span>
		</div>
		<div bind:this={chatDiv} class="box chat-box">
			{#each chat as c}
				<span>{c}</span>
			{/each}
		</div>
		<form class="chat-input" on:submit|preventDefault={sendMessage}>
			<input type="text" bind:value={chatInput} disabled={!$wsAuthed} />
			<button type="submit">CHAT</button>
		</form>
		<div class="info-btn">
			{#if kickable}
				<button
					on:click={kick}
					class="game-btn"
					disabled={!isPlayer || !table.Game.Playing || isMyTurn}
				>
					KICK AFK
				</button>
			{:else}
				<button
					on:click={startGame}
					class="game-btn"
					disabled={!isHost || table.Players.length !== 2 || table.Game.Playing}
				>
					START
				</button>
			{/if}
			<button on:click={movePlayerSlot} disabled={table.Game.Playing} class="game-btn">
				{isPlayer ? 'Spectate' : 'Play'}
			</button>
			<button on:click={leave} class="game-btn">Leave</button>
		</div>
	</div>

	<div class="section user-section">
		<div class="box">
			<b>Players</b>
			<span>
				{#if table.Players.length > 0}
					👑 {table.Players[0]}
				{:else}
					👑 empty
				{/if}
			</span>
			<span>
				{#if table.Players.length > 1}
					🕹️ {table.Players[1]}
				{:else}
					🕹️ empty
				{/if}
			</span>
		</div>
		<div class="box spectators">
			<b>Spectators</b>
			{#each table.Connections as c}
				{#if !table.Players.some((e) => e === c.UserId)}
					<span>{c.UserId}</span>
				{/if}
			{/each}
		</div>
	</div>

	{#if !$wsAuthed}
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
		display: flex;
		justify-content: center;
		align-items: center;
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
	.last-move {
		width: 20px;
		height: 20px;
		background-color: green;
		border-radius: 50%;
	}
	.game-btn {
		flex: 1 1 50%;
	}
	.passed {
		border: 5px green solid;
		box-sizing: border-box;
	}
	.passed:hover {
		background: whitesmoke;
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
	.blue-border {
		border: 1px blue solid;
	}
	.orange-border {
		border: 1px orange solid;
	}

	.chat-box {
		overflow-y: scroll;
		flex-grow: 1;
		height: 0px;
	}
	.chat-input {
		display: flex;
	}
	.chat-input > input {
		flex-grow: 1;
	}

	.info-btn {
		display: flex;
		gap: 5px;
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
