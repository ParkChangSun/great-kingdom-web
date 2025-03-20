<div class="container">
	<h2>Guide</h2>
	<div class="guide">
		<nav>
			<a href="/guide/gameplay">👾 게임 규칙</a>
			<a href="/guide/tactics">🌟 전략</a>
		</nav>

		<div>
			<slot />
		</div>
	</div>
</div>

<style>
	.container {
		width: 65%;
		background: white;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}

	.guide {
		display: flex;
	}

	nav {
		display: flex;
		flex-direction: column;
		border-right: 1px solid black;
		padding-right: 1rem;
		min-width: 150px;
		margin-right: 1rem;
	}
</style>
