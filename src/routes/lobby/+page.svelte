<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';

	let eventSource: EventSource;

	type Lobby = {
		id: string;
		name: string;
		player1: string;
		player2: string;
		isPlaying: Boolean;
		isLocked: Boolean;
	};
	let lobbies: Lobby[] = [];

	onMount(async () => {
		eventSource = new EventSource('http://localhost:8000/game/games', {
			withCredentials: true
		});

		eventSource.onerror = (e) => {
			console.log('onerror', e);
		};

		eventSource.addEventListener('message', (msg: MessageEvent<string>) => {
			lobbies = JSON.parse(msg.data);
		});
	});

	onDestroy(() => {
		eventSource.close();
	});

	let modalOn: Boolean = false;
	let modalLobbyId: string = '';
	let pass = '';
	const onSubmit = async () => {
		const res = await fetch(`http://localhost:8000/game/pass/${modalLobbyId}`, {
			method: 'POST',
			body: JSON.stringify({ password: pass }),
			credentials: 'include'
		});
		if (res.ok) {
			goto(`/game/${modalLobbyId}`);
		} else {
			alert('password incorrect');
		}
	};

	const onJoin = (l: Lobby) => {
		if (l.isLocked) {
			modalOn = true;
			modalLobbyId = l.id;
		} else {
			goto(`/game/${l.id}`);
		}
	};
</script>

{#if modalOn}
	<div class="modalback">
		<div class="modal">
			<form on:submit|preventDefault={onSubmit}>
				<p>input password</p>
				<input bind:value={pass} /><button type="submit">ok</button><button
					on:click={() => (modalOn = false)}>cancel</button
				>
			</form>
		</div>
	</div>
{/if}
<h2>Main Lobby</h2>
<a href="/host"> Create Lobby </a>
<div>
	{#if lobbies.length !== 0}
		{#each lobbies as l}
			<button class="lobby" on:click={() => onJoin(l)}
				><p>{l.name}</p>
				<p>P1 {l.player1} VS {l.player2} P2</p>
				<p class="isPlayingStatus" class:isPlaying={l.isPlaying}>
					{l.isPlaying ? 'PLAYING' : 'WAITING'}
				</p>
			</button>
		{/each}
	{:else}
		<button class="lobby"
			><p>name</p>
			<p>P1 pla1 VS pla2 P2</p>
			<p class="isPlayingStatus isPlaying">PLAYING</p>
		</button>
		<p>no game found</p>
	{/if}
</div>

<style>
	.modalback {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.8);
	}

	.modal {
		height: 20%;
		width: 30%;
		margin: 30% auto;
		background-color: white;
		border-radius: 10px;
	}
	.modal p {
		text-align: center;
	}

	.lobby {
		all: unset;
		background-color: aquamarine;
		border: 1px solid black;
		border-radius: 5px;
		padding: 5px;
		cursor: pointer;
	}
	.lobby:hover {
		background-color: rgb(124, 255, 255);
	}
	.lobby p {
		margin: 0;
	}

	.isPlayingStatus {
		color: gray;
	}
	.isPlaying {
		color: orangered;
	}

	a {
		all: unset;
		cursor: pointer;
		background-color: lightgray;
		padding: 1rem;
		border: 2px solid black;
	}
</style>
