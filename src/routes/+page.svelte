<script>
	import { i18n } from '$lib';
</script>

<svelte:head>
	<title>Great Kingdom | Great Kingdom Online</title>
	<meta name="description" content="Great Kingdom - Online board game" />
	<meta name="keywords" content="great kingdom" />
	<meta charset="UTF-8" />
	<meta name="rating" content="Safe For Kids" />
</svelte:head>

<h2>Home</h2>
<p>
	Building a kingdom is no easy task - more so if your enemy is trying to occupy the same territory.
	Build the biggest kingdom by strategically placing your own castles and destroying the enemy's: a
	single enemy castle is enough to win the game.
</p>
<p>
	Great Kingdom simplifies <a href="https://en.wikipedia.org/wiki/Go_(game)" target="_blank">Go</a>
	without taking the fun away for experienced players, making it the perfect gateway into the world of
	Go. It is the first of three games of the game series WIZSTONE, developed by Go grandmaster
	<a href="https://en.wikipedia.org/wiki/Lee_Sedol" target="_blank">Lee Sedol</a>.
</p>
<p>You can play Great Kingdom with players worldwide for free.</p>
<h2>How to play</h2>
<p>
	To play Great Kingdom, <a href="/user">register</a> an account first. You only need an ID and password.
</p>
<p>Then, go to the <a href="/lobby">lobby</a> and create/join game session.</p>
<h2>{$i18n('home.rules.title')}</h2>
<p>{$i18n('home.rules.1')}</p>
<p>{@html $i18n('home.rules.2')}</p>
<p>{@html $i18n('home.rules.3')}</p>
<p>{@html $i18n('home.rules.4')}</p>
<p>{$i18n('home.rules.5')}</p>
<p>{$i18n('home.rules.6')}</p>
<h2>About this project</h2>
<p>
	This <a href="https://github.com/ParkChangSun/great-kingdom-lambda" target="_blank">project</a> is
	built on the serverless architecture, containing
	<a href="https://en.wikipedia.org/wiki/Serverless_computing#Performance" target="_blank"
		>cold start problem</a
	>.
</p>
<p>This project is non-profit.</p>
<p class="footer-content">
	{$i18n('home.issues')} <a href="/chat">CHAT</a>
</p>
