<div class="container">
	<h2>그레이트 킹덤 온라인 가이드</h2>
	<div class="guide">
		<nav>
			<a href="/guide">📰 공지</a>
			<a href="/guide/gameplay">👾 게임 규칙</a>
			<a href="/guide/gametable">🎮 테이블 설명</a>
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
