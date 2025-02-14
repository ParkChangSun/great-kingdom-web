<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { locale, refreshToken, userInfoStore } from '$lib';
	import { onMount } from 'svelte';

	const navbar = [
		{ route: 'HOME', url: '/' },
		// { route: 'CHAT', url: '/chat' },
		{ route: 'PLAY', url: '/lobby' }
	];
	$: user = $userInfoStore.authorized ? $userInfoStore.id : 'LOG IN';

	onMount(() => {
		$locale = $page.url.searchParams.get('lang') ?? 'en';
		refreshToken();
	});
</script>

<div class="header">
	<h1>Great Kingdom Online</h1>
	<nav>
		<label for="locale">Language</label>
		<select bind:value={$locale} id="locale">
			<option value="kr">kr</option>
			<option value="en">en</option>
		</select>
		{#each navbar as n}
			<a
				href={`${n.url}${$locale === 'en' ? '' : `?lang=${$locale}`}`}
				class:active={$page.url.pathname === n.url}>{n.route}</a
			>
		{/each}
		<a
			href={`/user${$locale === 'en' ? '' : `?lang=${$locale}`}`}
			class:active={$page.url.pathname === '/user'}>{user}</a
		>
	</nav>
</div>

<div class="body">
	<slot />
</div>

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

	.body {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		margin: 0;
		background-color: #f4f4f4;
	}
</style>
