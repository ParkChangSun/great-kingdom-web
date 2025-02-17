<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { API_URL, locale, refreshToken, userInfoStore } from '$lib';
	import { onDestroy, onMount } from 'svelte';

	type GameLobby = {
		GameLobbyId: string;
		GameLobbyName: string;
		Players: string[];
	};
	const getGameLobbies = async () => {
		const res = await fetch(`${$API_URL}/games`, {
			method: 'GET',
			credentials: 'include'
		});
		if (res.ok) {
			let gameLobbies: GameLobby[] = await res.json();
			return gameLobbies;
		} else if (res.status === 401) {
			refreshToken();
			throw new Error('auth expired. try again');
		} else {
			throw new Error(res.statusText);
		}
	};
	let lobbiesPromise: Promise<GameLobby[]> = getGameLobbies();

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;
	$: if (chat && chatDiv) {
		chatDiv.scroll({ top: chatDiv.scrollHeight, behavior: 'smooth' });
	}
	let socket: WebSocket;
	const connectSocket = () => {
		socket = new WebSocket(`wss://websocket.greatkingdom.net?GameSessionId=globalchat`);
		socket.addEventListener('open', () => {
			console.log('Opened');
			chat = [...chat, 'connected.'];
		});
		socket.addEventListener('close', (e) => {
			console.log(e);
		});
		socket.addEventListener('error', (e) => {
			console.log(e);
			chat = [...chat, 'error try again'];
			// refreshToken();
			// addChat('refreshing...');
		});
		socket.addEventListener('message', async (e) => {
			const { Chat }: { Chat: string } = JSON.parse(e.data);
			chat = [...chat, Chat];
		});
	};

	$: if (browser) {
		connectSocket();
	}

	let chatInput: string = '';
	const sendChat = async () => {
		socket.send(JSON.stringify({ action: 'globalchat', Chat: chatInput }));
		chatInput = '';
	};

	let popupContainer: HTMLElement;
	const closePopup = () => {
		popupContainer.classList.add('inactive');
	};
	const openPopup = () => {
		popupContainer.classList.remove('inactive');
	};
	let lobbyNameInput: string = '';

	let createPromise: Promise<void>;
	const createLobby = () => {
		if (lobbyNameInput === '') {
			return;
		}
		createPromise = postCreateLobby();
	};
	const postCreateLobby = async () => {
		const res = await fetch(`${$API_URL}/game`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				GameSessionName: lobbyNameInput
			})
		});
		if (res.ok) {
			const { GameSessionId }: { GameSessionId: string } = await res.json();
			goto(`/game?gameId=${GameSessionId}`);
		} else if (res.status === 401) {
			refreshToken();
			throw new Error('auth expired. try again');
		} else {
			throw new Error(res.statusText);
		}
	};
</script>

<div class="container">
	<div class="lobby-header">
		<h2>Play Great Kingdom</h2>
		<div class="lobby-header-buttons">
			<button on:click={openPopup}>Create Lobby</button>
			<button on:click={() => (lobbiesPromise = getGameLobbies())}>Reload List</button>
		</div>
	</div>
	<div class="lobby-grid">
		{#await lobbiesPromise}
			<p>loading</p>
		{:then lobbies}
			{#if lobbies.length === 0}
				<p>No game found</p>
			{/if}
			{#each lobbies as l}
				<button class="lobby" on:click={() => goto(`/game?gameId=${l.GameLobbyId}`)}>
					<span>{l.GameLobbyName}</span>
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
	<div class="chat-container">
		<div class="chat">
			<div class="chat-box" bind:this={chatDiv}>
				{#each chat as c}
					<div class="chat-message">{c}</div>
				{/each}
			</div>
			<form class="chat-input-form" on:submit|preventDefault={sendChat}>
				<input bind:value={chatInput} placeholder="Chat to #Maintainer" />
				<button type="submit">Send</button>
			</form>
		</div>
		<div class="chat-users"></div>
	</div>
	<div class="popup-container inactive" bind:this={popupContainer}>
		<h2>Create Lobby</h2>
		{#await createPromise}
			<p>loading</p>
		{:then}
			<form class="popup" on:submit|preventDefault={createLobby}>
				<label>Name <input bind:value={lobbyNameInput} /></label><br />
				<button type="submit">Create</button>
			</form>
		{:catch e}
			<p>{e.message}</p>
		{/await}
		<button on:click={closePopup}>Close</button>
	</div>
</div>

<style>
	h2 {
		margin: 0;
	}
	.container {
		width: 80%;
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
		border: 1px solid #ccc;
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
	.lobby:nth-child(4n + 2),
	.lobby:nth-child(4n + 3) {
		background: #ffa500;
	}
	.lobby-players {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.chat-container {
		display: flex;
		gap: 20px;
		margin-top: 20px;
		height: 250px;
	}
	.chat {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		background: white;
		flex: 3;
	}
	.chat-box {
		border: 1px solid #ccc;
		padding: 10px;
		overflow-y: auto;
		background: white;
		flex: 3;
	}
	.chat-users {
		border: 1px solid #ccc;
		padding: 10px;
		background: white;
		width: 150px;
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
	.inactive {
		display: none;
	}
</style>
