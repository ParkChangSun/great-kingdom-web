<script lang="ts">
	import { userInfoStore, API_URL, refreshToken } from '$lib';
	import { onMount } from 'svelte';

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
	let getUserPromise: Promise<UserInfo>;

	const getUserInfo = async () => {
		const res = await fetch(`${$API_URL}/user?UserId=${$userInfoStore.id}`, {
			method: 'GET',
			credentials: 'include'
		});
		if (res.ok) {
			let userInfo = await res.json();
			return userInfo;
		} else if (res.status === 401) {
			refreshToken();
			throw new Error('auth expired. try again');
		} else {
			throw new Error(res.status.toString());
		}
	};

	$: if ($userInfoStore.authorized) {
		mode = 'user';
		getUserPromise = getUserInfo();
	}

	let signInId = '';
	let signInPass = '';
	let signInMessage = '';

	const handleSignin = async () => {
		if (signInId === '' || signInPass === '') {
			return;
		}
		const res = await fetch(`${$API_URL}/signin`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				Id: signInId,
				Password: signInPass
			})
		});
		if (res.ok) {
			const jsonBody = await res.json();
			userInfoStore.set({ authorized: true, id: jsonBody.Id });
			signInId = '';
			signInPass = '';
		} else {
			signInMessage = res.statusText;
			alert(res.statusText);
		}
	};

	let signUpId = '';
	let signUpPass = '';
	let signUpPassConfirm = '';
	let signUpMessage = '';

	const handleSignUp = async () => {
		if (signUpId === '' || signUpPass === '') {
			return;
		}
		if (signUpPass !== signUpPassConfirm) {
			signUpMessage = 'password wrong';
		}
		const res = await fetch(`${$API_URL}/signup`, {
			method: 'POST',
			credentials: 'omit',
			body: JSON.stringify({
				Id: signUpId,
				Password: signUpPass
			})
		});
		if (res.ok) {
			alert('Sign Up Success');
			signUpId = '';
			signUpPass = '';
			signUpPassConfirm = '';
		} else {
			// alert(`Sign Up Failed : ${await res.text()}`);
			signUpMessage = res.statusText;
		}
	};

	const handleSignOut = async () => {
		await fetch(`${$API_URL}/signout`, {
			method: 'POST',
			credentials: 'include'
		});
		userInfoStore.set({ authorized: false, id: '' });
		mode = 'signin';
	};

	let mode = 'signin';
</script>

<div class="container">
	{#if mode === 'signin'}
		<form class="signin" on:submit|preventDefault={handleSignin}>
			<h2>SIGN IN</h2>
			<input bind:value={signInId} placeholder="ID" />
			<input type="password" bind:value={signInPass} placeholder="PASSWORD" />
			{#if signInMessage !== ''}
				<p class="error">{signInMessage}</p>
			{/if}
			<button class="submit-button" type="submit">SIGN IN</button>
			<button class="toggle-button" on:click={() => (mode = 'signup')}>Go To Sign Up</button>
		</form>
	{:else if mode === 'signup'}
		<form class="signup" on:submit|preventDefault={handleSignUp}>
			<h2>SIGN UP</h2>
			<input bind:value={signUpId} placeholder="ID" />
			<input type="password" bind:value={signUpPass} placeholder="PASSWORD" />
			<input type="password" bind:value={signUpPassConfirm} placeholder="PASSWORD CONFIRM" />
			{#if signUpMessage !== ''}
				<p class="error">{signUpMessage}</p>
			{/if}
			<button class="submit-button" type="submit">SIGN UP</button>
			<button class="toggle-button" on:click={() => (mode = 'signin')}>Go To Sign In</button>
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
				<p>no games found</p>
			{:else}
				<div class="game-history">
					{#each u.RecentGames as g}
						<div class={`game-history-item ${g.WinnerId === u.UserId ? 'win' : 'lose'}`}>
							{g.BlueId} VS {g.OrangeId}
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
	}
	.win {
		background-color: lightblue;
	}
	.loss {
		background-color: lightcoral;
	}
</style>
