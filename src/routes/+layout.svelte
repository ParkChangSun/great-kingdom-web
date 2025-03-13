<script lang="ts">
	import { page } from '$app/stores';
	import { userInfoStore } from '$lib';

	const navbar = [
		{ route: 'HOME', url: '/' },
		{ route: 'PLAY', url: '/lobby' }
	];
	$: user = $userInfoStore.Authorized ? $userInfoStore.Id : 'LOG IN';
</script>

<svelte:head>
	<title>그레이트 킹덤 온라인 - Great Kingdom Online</title>
	<meta name="rating" content="Safe For Kids" />
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
	<meta charset="utf-8" />
	<meta name="robots" content="all" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<meta
		name="description"
		content="이세돌 9단이 개발한 보드게임 '그레이트 킹덤'을 온라인으로 즐겨보세요. 바둑의 전략을 간단하고 흥미롭게 재해석한 이 게임은 초보자부터 전문가까지 모두에게 적합합니다."
	/>
	<meta
		name="keywords"
		content="그레이트 킹덤, 이세돌, 보드게임, 바둑, 전략 게임, 온라인 보드게임, 위즈스톤"
	/>
</svelte:head>

<header>
	<h1>Great Kingdom Online</h1>
	<nav>
		{#each navbar as n}
			<a href={`${n.url}`} class:active={$page.url.pathname === n.url}>{n.route}</a>
		{/each}
		<a href="/user" class:active={$page.url.pathname === '/user'}>{user}</a>
	</nav>
</header>

<div class="body">
	<slot />
</div>

<footer>
	Original board game "Great Kingdom" is owned by ⓒ KOREA BOARDGAMES worldwide under a contract with
	Lee Se-dol. This project is non-profit.
</footer>

<style>
	header {
		display: flex;
		border-bottom: 1px solid gray;
		justify-content: space-between;
		background-color: beige;
	}
	h1 {
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

	.body {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 90vh;
		margin: 0;
		background-color: #f4f4f4;
	}
</style>
