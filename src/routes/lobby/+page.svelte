<script lang="ts">
	import { lobbyStore } from '$lib';
	import { onDestroy, onMount } from 'svelte';

	let eventSource: EventSource;

	onMount(async () => {
		eventSource = new EventSource('http://localhost:8000/game/games', {
			withCredentials: true
		});

		eventSource.onerror = (e) => {
			console.log('onerror', e);
		};

		eventSource.addEventListener('message', (msg: MessageEvent<string>) => {
			lobbyStore.set(JSON.parse(msg.data));
		});
	});

	onDestroy(() => {
		eventSource.close();
	});

	// prompt('hello');
</script>

<h2>Lobby</h2>
{#if $lobbyStore.length !== 0}
	<ul>
		{#each $lobbyStore as l}
			<li>
				<a href={`/game/${l.id}`}>{l.name}</a>
				<p>{l.id} {l.createdBy} {l.isLocked} {l.playersNum}</p>
			</li>
		{/each}
	</ul>
{:else}
	<p>no game found</p>
{/if}
<a href="/host"> Create Lobby </a>
