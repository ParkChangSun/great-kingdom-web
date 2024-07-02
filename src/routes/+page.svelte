<script>
	import { i18n } from '$lib';
</script>

<svelte:head>
	<title>Great Kingdom Online</title>
	<meta
		name="description"
		content="Great Kingdom simplifies Go
	without taking the fun away for experienced players, making it the perfect gateway into the world of
	Go. It is the first of three games of the game series WIZSTONE, developed by Go grandmaster
	Lee Sedol. You can play Great Kingdom with players worldwide for free."
	/>
	<meta name="keywords" content="great kingdom" />
	<meta charset="UTF-8" />
	<meta name="rating" content="Safe For Kids" />

	<link rel="canonical" href="https://greatkingdom.net/" />
	<link rel="alternate" hreflang="en" href="https://greatkingdom.net/" />
	<link rel="alternate" hreflang="kr" href="https://greatkingdom.net/?lang=kr" />
</svelte:head>

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
<p>{@html $i18n('home.about.3')}</p>
