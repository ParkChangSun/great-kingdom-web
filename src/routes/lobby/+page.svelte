<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_URL, refreshToken, userInfoStore } from '$lib';
	import { onDestroy, onMount } from 'svelte';
	// import loading from '$lib/assets/loading.webp';

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
		} else if (Math.floor(res.status / 100) === 4) {
			const valid = await refreshToken();
			if (!valid) {
				userInfoStore.set({ authorized: false, id: '' });
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

	let createStatus: string = 'Create & Join';

	const createHandler = async () => {
		createStatus = 'Loading...';

		fetch(`${$API_URL}/game`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				GameSessionName: lobbyName
			})
		})
			.then((res) => res.json())
			.then((data) => {
				const { GameSessionId }: { GameSessionId: string } = data;
				goto(`/game?gameId=${GameSessionId}`);
			})
			.catch((e) => {
				console.log(e);
				createStatus = 'Create & Join';
			});
	};
</script>

<p class="header">Main Lobby</p>
<hr />
<form on:submit|preventDefault={createHandler}>
	<p>Create Game Session</p>
	<input type="text" placeholder="Name" bind:value={lobbyName} />
	<button type="submit">{createStatus}</button>
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
	<img src="./loading.webp" alt="loading" />
{/if}

<style>
	p {
		text-align: center;
	}
	.header {
		margin: 2rem auto;
		font-size: 2rem;
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
