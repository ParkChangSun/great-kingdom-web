<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { userInfoStore } from '$lib';

	const navbar = [
		{ route: 'home', url: '/' },
		{ route: 'play', url: '/lobby' }
	];

	$: user = $userInfoStore.id === '' ? 'login' : $userInfoStore.id;
</script>

<!-- hide layout when in game -->

<h1>Great Kingdom</h1>

<nav>
	{#each navbar as n}
		<a href={n.url} class:active={$page.url.pathname === n.url}>{n.route}</a>
	{/each}
	<a href="/user" class:active={$page.url.pathname === '/user'}>{user}</a>
</nav>

<slot />

<h2>footer</h2>
<p>remove cookie&localstorage</p>

<style>
	h2 {
		color: aqua;
	}

	nav {
		display: flex;
	}

	a {
		padding: 1rem;
	}

	.active {
		background-color: cornflowerblue;
	}
</style>
