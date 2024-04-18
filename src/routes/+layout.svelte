<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { userInfoStore } from '$lib';

	const navbar = [
		{ route: 'HOME', url: '/' },
		{ route: 'CHAT', url: '/chat' },
		{ route: 'PLAY', url: '/lobby' }
	];

	$: user = $userInfoStore.id === '' ? 'LOG IN' : $userInfoStore.id;
	// $: console.log($page.url.pathname);
</script>

<!-- hide layout when in game -->

<div class="header">
	<h1>Great Kingdom</h1>
	<nav>
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
</style>
