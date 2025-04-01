<script lang="ts">
	import { userInfoStore, authorizedApi, unauthorizedApi, type Authorization } from '$lib';
	import { isAxiosError } from 'axios';

	let mode = 'signin';

	type UserInfo = {
		UserId: string;
		W: number;
		L: number;
		RecentGames: {
			BlueId: string;
			OrangeId: string;
			WinnerId: string;
		}[];
	};

	const getUserInfo = async () => {
		try {
			const p = await authorizedApi.get<UserInfo>(`/user?UserId=${$userInfoStore.Id}`);
			return p.data;
		} catch (error) {
			throw new Error('error getuserinfo');
		}
	};
	let getUserPromise: Promise<UserInfo>;

	let signInId = '';
	let signInPass = '';
	let signInMessage = '';

	let prom: Promise<void>;
	const handleSignin = async () => {
		if (signInId === '' || signInPass === '') {
			signInMessage = 'invalid input';
			return;
		}

		try {
			const res = await unauthorizedApi.post<Authorization>('/sign-in', {
				Id: signInId,
				Password: signInPass
			});
			userInfoStore.set(res.data);
		} catch (error) {
			if (isAxiosError(error)) {
				signInMessage = error.response?.data.message;
			} else console.log(error);
		}
	};

	let signUpId = '';
	let signUpPass = '';
	let signUpPassConfirm = '';
	let signUpMessage = '';

	const handleSignUp = async () => {
		if (signUpId === '' || signUpPass === '' || signUpPass !== signUpPassConfirm) {
			signUpMessage = 'invalid input';
			return;
		}

		try {
			const res = await unauthorizedApi.post('/sign-up', {
				Id: signUpId,
				Password: signUpPass
			});
			alert('Sign Up Success');
			mode = 'signin';
		} catch (error) {
			if (isAxiosError(error)) {
				signUpMessage = error.response?.data.message;
			} else if (error instanceof Error) console.log(error);
		}

		signUpId = '';
		signUpPass = '';
		signUpPassConfirm = '';
	};

	const handleSignOut = async () => {
		try {
			const res = await authorizedApi.post<Authorization>('/sign-out');
			userInfoStore.set(res.data);
		} catch (error) {
			userInfoStore.set({ Authorized: false, Id: '', AccessToken: '' });
			if (error instanceof Error) console.log(error);
		}
	};

	$: if ($userInfoStore.Authorized) {
		mode = 'user';
		getUserPromise = getUserInfo();
	} else {
		mode = 'signin';
	}
</script>

<svelte:head>
	<title>{$userInfoStore.Authorized ? $userInfoStore.Id : '홈'} - 그레이트 킹덤 온라인</title>
</svelte:head>

<div class="container">
	{#if mode === 'signin'}
		<form class="signin" on:submit|preventDefault={() => (prom = handleSignin())}>
			<h2>로그인</h2>
			<input bind:value={signInId} placeholder="ID" />
			<input type="password" bind:value={signInPass} placeholder="PASSWORD" />
			{#if signInMessage !== ''}
				<p class="error">{signInMessage}</p>
			{/if}
			{#await prom}
				<button class="submit-button" type="submit" disabled> ⏳ </button>
			{:then v}
				<button class="submit-button" type="submit"> 로그인 </button>
			{/await}
			<button class="toggle-button" on:click={() => (mode = 'signup')}>가입</button>
		</form>
	{:else if mode === 'signup'}
		<form class="signup" on:submit|preventDefault={() => (prom = handleSignUp())}>
			<h2>가입</h2>
			<input bind:value={signUpId} placeholder="ID" />
			<input type="password" bind:value={signUpPass} placeholder="PASSWORD" />
			<input type="password" bind:value={signUpPassConfirm} placeholder="PASSWORD CONFIRM" />
			{#if signUpMessage !== ''}
				<p class="error">{signUpMessage}</p>
			{/if}
			{#await prom}
				<button class="submit-button" type="submit" disabled> ⏳ </button>
			{:then v}
				<button class="submit-button" type="submit"> 가입 </button>
			{/await}
			<button class="toggle-button" on:click={() => (mode = 'signin')}>로그인</button>
		</form>
	{:else}
		{#await getUserPromise}
			<p>loading</p>
		{:then u}
			<h2>{u.UserId}</h2>
			<button on:click={handleSignOut} class="signout">Sign Out</button>
			<p>WINs : {u.W}</p>
			<p>LOSSes : {u.L}</p>
			{#if u.RecentGames.length === 0}
				<p>No game history</p>
			{:else}
				<div class="game-history">
					{#each u.RecentGames as g}
						<div class={`game-history-item`}>
							{#if g.WinnerId === g.BlueId}
								🏆
							{/if}
							{g.BlueId} VS {g.OrangeId}
							{#if g.WinnerId === g.OrangeId}
								🏆
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{:catch e}
			<p>{e.message}</p>
		{/await}
	{/if}
</div>

<style>
	.container {
		width: 30%;
		padding: 20px;
		background: white;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
	input {
		width: 100%;
		margin: 10px 0;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
		box-sizing: border-box;
	}
	.submit-button {
		width: 100%;
		margin: 10px 0;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
		background-color: #28a745;
		color: white;
		cursor: pointer;
		border: none;
	}
	.submit-button:hover {
		background-color: #218838;
	}
	.toggle-button {
		all: unset;
		color: #007bff;
		text-decoration: none;
		text-align: center;
	}
	.toggle-button:hover {
		text-decoration: underline;
	}
	.error {
		color: red;
		font-size: 0.9em;
	}
	.signout {
		padding: 5px 10px;
		background-color: red;
		color: white;
		border: none;
		cursor: pointer;
	}
	.game-history {
		padding: 10px;
		margin-bottom: 5px;
		border-radius: 5px;
		max-height: 400px;
		overflow-y: auto;
	}
	.game-history-item {
		padding: 10px;
		margin-bottom: 5px;
		border-radius: 5px;
		border: 1px solid black;
	}
</style>
