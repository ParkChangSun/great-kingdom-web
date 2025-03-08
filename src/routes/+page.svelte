<script>
	import { page } from '$app/stores';
	import { i18n, locale } from '$lib';
	import { onMount } from 'svelte';

	onMount(() => {
		$locale = $page.url.searchParams.get('lang') ?? 'en';
	});
</script>

<svelte:head>
	<title>{$i18n('title')}</title>
	<meta name="description" content={$i18n('description')} />
	<meta name="keywords" content="great kingdom" />
	<meta charset="UTF-8" />
	<meta name="rating" content="Safe For Kids" />

	<link rel="canonical" href="https://greatkingdom.net/" />
	<link rel="alternate" hreflang="en" href="https://greatkingdom.net/" />
	<link rel="alternate" hreflang="kr" href="https://greatkingdom.net/?lang=kr" />
</svelte:head>

<div class="container">
	<h2>Home</h2>
	<p>{$i18n('home.main.1')}</p>
	<p>{@html $i18n('home.main.2')}</p>
	<p>{$i18n('home.main.3')}</p>

	<h2>How to play</h2>
	<p>{@html $i18n('home.howto.1')}</p>
	<p>{@html $i18n('home.howto.2')}</p>

	<h2>{$i18n('home.rules.title')}</h2>
	<p>{$i18n('home.rules.1')}</p>
	<p>{@html $i18n('home.rules.2')}</p>
	<p>{@html $i18n('home.rules.3')}</p>
	<p>{@html $i18n('home.rules.4')}</p>
	<p>{$i18n('home.rules.5')}</p>
	<p>{$i18n('home.rules.6')}</p>

	<h2>About this project</h2>
	<p>{$i18n('home.about.1')}</p>
	<p>{$i18n('home.about.2')}</p>
	<p>This project is a side project of a junior dev.</p>
</div>

<p>0</p>

<style>
	.container {
		width: 80%;
		background: white;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
</style>
