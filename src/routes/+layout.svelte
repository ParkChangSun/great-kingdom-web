<script lang="ts">
	import { page } from '$app/stores';
	import { locale, refreshToken, userInfoStore } from '$lib';
	import { onMount } from 'svelte';

	const navbar = [
		{ route: 'HOME', url: '/' },
		{ route: 'CHAT', url: '/chat' },
		{ route: 'PLAY', url: '/lobby' }
	];
	$: user = $userInfoStore.authorized ? $userInfoStore.id : 'LOG IN';

	onMount(() => {
		refreshToken();
	});
</script>

<div class="header">
	<h1>Great Kingdom</h1>
	<nav>
		<label for="locale">Language</label>
		<select bind:value={$locale} id="locale">
			<option value="kr">kr</option>
			<option value="en">en</option>
		</select>
		{#each navbar as n}
			<a href={n.url} class:active={$page.url.pathname === n.url}>{n.route}</a>
		{/each}
		<a href="/user" class:active={$page.url.pathname === '/user'}>{user}</a>
	</nav>
</div>

<slot />

<div class="footer" />

<style>
	.header {
		display: flex;
		border-bottom: 1px solid gray;
		justify-content: space-between;
		background-color: beige;
	}
	.header h1 {
		margin: 0;
	}

	nav {
		display: flex;
	}
	nav > a {
		all: unset;
		padding: 1rem;
		cursor: pointer;
		background-color: skyblue;
		color: darkslategray;
	}
	.active {
		background-color: orange;
	}

	label,
	select {
		align-self: center;
	}
</style>
