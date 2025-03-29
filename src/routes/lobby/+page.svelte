<script lang="ts">
	import { building } from '$app/environment';
	import { goto } from '$app/navigation';
	import { authorizedApi, connectWebSocket, userInfoStore, WS_URL } from '$lib';
	import { isAxiosError } from 'axios';
	import { onDestroy, onMount, tick } from 'svelte';
	import type { Writable } from 'svelte/store';

	type GameTable = {
		GameTableId: string;
		GameTableName: string;
		Players: string[];
	};

	let getTablesBtn = false;
	const getGameTables = async () => {
		getTablesBtn = true;
		try {
			let res = await authorizedApi.get<GameTable[]>('/table');
			getTablesBtn = false;
			return res.data;
		} catch (error) {
			if (isAxiosError(error)) {
				console.log(error.response?.data.message);
				throw new Error('log in first');
			} else {
				console.log(error);
				throw new Error('error');
			}
		}
	};
	let getTablesPromise = getGameTables();

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;

	const handler = (data: any) => {
		if (data.EventType === 'CHAT') {
			const { Chat }: { Chat: string } = data;
			chat = [...chat, Chat];
			tick().then(() => {
				const { scrollTop, scrollHeight, clientHeight } = chatDiv;
				if (scrollTop + clientHeight >= scrollHeight - 50)
					chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
			});
		} else {
			console.log(data);
		}
	};

	let socket: WebSocket;
	let authorized: Writable<boolean>;
	let cleanUp = () => {};
	const unsub = userInfoStore.subscribe((v) => {
		cleanUp();
		if (!v.Authorized) return;
		[socket, authorized, cleanUp] = connectWebSocket(`${WS_URL}?GameTableId=globalchat`, handler);
	});

	onDestroy(() => {
		cleanUp();
		unsub();
	});

	let chatInput: string = '';
	const sendChat = () => {
		if (chatInput === '') return;
		socket.send(JSON.stringify({ action: 'globalchat', Chat: chatInput }));
		chatInput = '';
	};

	let tableNameInput: string = '';
	let createTablePromise: Promise<void>;
	const postCreateTable = async () => {
		try {
			const res = await authorizedApi.post<{ GameTableId: string }>('/table', {
				GameTableName: tableNameInput
			});
			goto(`/table?tableId=${res.data.GameTableId}`);
		} catch (error) {
			throw new Error('error postcreatetable');
		}
	};
	const createTable = () => {
		if (tableNameInput === '') return;
		createTablePromise = postCreateTable();
	};

	const enterTable = (tableId: string) => {
		if (!$userInfoStore.Authorized) return;
		goto(`/table?tableId=${tableId}`);
	};

	let isPopupOpened = false;
</script>

<div class="container">
	<div class="lobby-header">
		<h2>Play Great Kingdom</h2>
		<div class="lobby-header-buttons">
			<button
				on:click={() => (isPopupOpened = !isPopupOpened)}
				disabled={!$userInfoStore.Authorized || getTablesBtn}
			>
				Create Game
			</button>
			<button on:click={() => (getTablesPromise = getGameTables())} disabled={getTablesBtn}>
				Reload
			</button>
		</div>
	</div>
	<div class="lobby-grid">
		{#await getTablesPromise}
			<p>⏳</p>
		{:then lobbies}
			{#if lobbies.length === 0}
				<p>No game found</p>
			{/if}
			{#each lobbies as l}
				<button class="lobby" on:click={() => enterTable(l.GameTableId)}>
					<span>{l.GameTableName}</span>
					<div class="lobby-players">
						{#if l.Players.length == 0}
							<span>empty</span>
							<span>empty</span>
						{/if}
						{#if l.Players.length == 1}
							<span>{l.Players[0]}</span>
							<span>empty</span>
						{/if}
						{#if l.Players.length == 2}
							<span>{l.Players[0]}</span>
							<span>{l.Players[1]}</span>
						{/if}
					</div>
				</button>
			{/each}
		{:catch e}
			<p>{e.message}</p>
		{/await}
	</div>
	<div class="chat">
		<h2>Chat</h2>
		<div class="chat-box" bind:this={chatDiv}>
			{#each chat as c}
				<div class="chat-message">{c}</div>
			{/each}
		</div>
		<form class="chat-input-form" on:submit|preventDefault={sendChat}>
			<input
				bind:value={chatInput}
				disabled={!$authorized}
				placeholder={$authorized ? 'Send chat message' : 'Connecting...'}
			/>
			<button type="submit">Send</button>
		</form>
	</div>

	{#if isPopupOpened}
		<div class="popup-container">
			<h2>Create Game</h2>
			{#await createTablePromise}
				<p>⏳</p>
			{:then}
				<form class="popup" on:submit|preventDefault={createTable}>
					<label>Name <input bind:value={tableNameInput} /></label><br />
					<button type="submit">Create</button>
				</form>
			{:catch e}
				<p>{e.message}</p>
			{/await}
			<button on:click={() => (isPopupOpened = !isPopupOpened)}>Close</button>
		</div>
	{/if}
</div>

<style>
	h2 {
		margin: 0;
	}
	.container {
		width: 65%;
		background: white;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}

	.lobby-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
	}
	.lobby-header-buttons {
		display: flex;
	}

	.lobby-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		max-height: 400px;
		overflow-y: auto;
	}
	.lobby {
		all: unset;
		display: block;
		padding: 10px;
		border: 1px solid black;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		height: 80px;
	}
	.lobby:nth-child(4n + 1),
	.lobby:nth-child(4n + 4) {
		background: #87cefa;
	}
	.lobby:nth-child(4n + 1):hover,
	.lobby:nth-child(4n + 4):hover {
		background: #00bfff;
	}
	.lobby:nth-child(4n + 2),
	.lobby:nth-child(4n + 3) {
		background: #ffa500;
	}
	.lobby:nth-child(4n + 2):hover,
	.lobby:nth-child(4n + 3):hover {
		background: #ff8c00;
	}
	.lobby-players {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.chat {
		display: flex;
		flex-direction: column;
		margin-top: 20px;
		height: 250px;
	}
	.chat-box {
		border: 1px solid #ccc;
		padding: 10px;
		overflow-y: auto;
		background: white;
		flex: 3;
	}
	.chat-input-form {
		display: flex;
		margin-top: 10px;
	}
	.chat-input-form input {
		flex: 1;
		padding: 5px;
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
