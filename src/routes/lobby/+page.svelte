<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_URL, refreshToken, userInfoStore } from '$lib';
	import { onDestroy, onMount } from 'svelte';

	type GameSession = {
		GameSessionId: string;
		GameSessionName: string;
	};
	let gameSessions: GameSession[] = [];
	let loaded: boolean = false;

	const getSessions = async () => {
		loaded = false;

		const res = await fetch(`${$API_URL}/games`, {
			method: 'GET',
			credentials: 'include'
		});

		if (res.ok) {
			gameSessions = await res.json();
			loaded = true;
		} else if (res.status === 401) {
			await refreshToken();
			if (!$userInfoStore.authorized) {
				alert('login!');
				goto('/user');
			}
		} else {
			alert(res.statusText);
		}

		loaded = true;
	};

	onMount(async () => {
		getSessions();
	});

	let lobbyName: string;
	let lobbyPassword: string;

	let isCreating: boolean = false;

	const createHandler = async () => {
		isCreating = true;

		const res = await fetch(`${$API_URL}/game`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				GameSessionName: lobbyName
			})
		});

		if (res.ok) {
			const { GameSessionId }: { GameSessionId: string } = await res.json();
			goto(`/game?gameId=${GameSessionId}`);
		} else if (res.status === 401) {
			await refreshToken();
			if (!$userInfoStore.authorized) {
				alert('login!');
				goto('/user');
			}
		} else {
			alert(res.statusText);
		}

		isCreating = false;
	};
</script>

<p class="header">Main Lobby</p>
<hr />
<form on:submit|preventDefault={createHandler}>
	<p>Create Game Session</p>
	<input type="text" placeholder="Name" bind:value={lobbyName} />
	<button type="submit">{isCreating ? 'Loading...' : 'Create & Join'}</button>
</form>
<hr />
<div class="sessionsHeader">
	<p>Online Game Sessions</p>
	<button class="reload" disabled={!loaded} on:click={getSessions}>Reload</button>
</div>

{#if loaded}
	{#if gameSessions.length !== 0}
		<div class="sessions">
			{#each gameSessions as l}
				<button class="lobby" on:click={() => goto(`/game?gameId=${l.GameSessionId}`)}
					><p>{l.GameSessionName}</p></button
				>
			{/each}
		</div>
	{:else}
		<p>No Game Sessions Online</p>
	{/if}
{:else}
	<img src="./loading.webp" alt="loading" class="center" />
	<p class="center">Loading Game Sessions...</p>
{/if}

<style>
	p {
		text-align: center;
	}
	.header {
		margin: 2rem auto;
		font-size: 2rem;
	}

	.center {
		margin: auto;
		display: block;
	}

	.sessionsHeader {
		position: relative;
	}
	.reload {
		position: absolute;
		right: 0;
		top: 0;
	}

	.sessions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.sessions .lobby:nth-child(2n + 1) {
		background-color: aqua;
	}
	.sessions .lobby:nth-child(2n) {
		background-color: orange;
	}
	.lobby {
		all: unset;
		font-size: 1.5rem;
		padding: 0.5rem;
		border-radius: 1rem;
	}
	.lobby > p {
		margin: 0;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	input {
		font-size: 1.5rem;
	}
</style>
