<script>
	import { i18n } from '$lib';
</script>

<svelte:head>
	<title>Great Kingdom</title>
	<meta name="description" content="Great Kingdom: Online board game" />
	<meta name="keywords" content="great kingdom" />
	<meta charset="UTF-8" />
</svelte:head>

<h2>{$i18n('home.rules.title', [])}</h2>
<p>{$i18n('home.rules.1', [])}</p>
<p>{@html $i18n('home.rules.2', [])}</p>
<p>{@html $i18n('home.rules.3', [])}</p>
<p>{@html $i18n('home.rules.4', [])}</p>
<p>{$i18n('home.rules.5', [])}</p>
<p>{$i18n('home.rules.6', [])}</p>

<p class="footer-content">
	{$i18n('home.issues', [])} <a href="/chat">CHAT</a>
</p>
<a href="https://github.com/ParkChangSun/great-kingdom-lambda">GITHUB</a>
