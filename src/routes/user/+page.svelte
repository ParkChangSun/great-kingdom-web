<script lang="ts">
	import { userInfoStore, API_URL, refreshToken } from '$lib';
	import { onMount } from 'svelte';

	type UserInfo = {
		W: number;
		L: number;
		D: number;
	};
	let userInfo: UserInfo = { W: 0, L: 0, D: 0 };
	let loaded = false;

	const getUserInfo = async () => {
		loaded = false;

		const res = await fetch(`${$API_URL}/user?UserId=${$userInfoStore.id}`, {
			method: 'GET',
			credentials: 'include'
		});
		if (res.ok) {
			userInfo = await res.json();
			loaded = true;
		} else if (res.status === 401) {
			await refreshToken();
		} else {
			throw new Error(res.status.toString());
		}
	};

	onMount(() => {
		if ($userInfoStore.authorized) {
			getUserInfo();
		}
	});

	$: if ($userInfoStore.authorized) {
		getUserInfo();
	}

	let idInput: string;
	let passwordInput: string;

	const handleSignin = async () => {
		const res = await fetch(`${$API_URL}/signin`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				Id: idInput,
				Password: passwordInput
			})
		});
		if (res.ok) {
			const jsonBody = await res.json();
			userInfoStore.set({ authorized: true, id: jsonBody.Id });
		} else {
			alert(res.text());
		}
		passwordInput = '';
	};

	let signUpId: string;
	let signUpPass: string;
	let passConfirm: string;

	const handleSignUp = async () => {
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
			passConfirm = '';
		} else {
			alert(`Sign Up Failed : ${await res.text()}`);
		}
	};

	const handleSignOut = async () => {
		await fetch(`${$API_URL}/signout`, {
			method: 'POST',
			credentials: 'include'
		});
		userInfoStore.set({ authorized: false, id: '' });
	};

	let mode = true;
</script>

{#if $userInfoStore.authorized}
	{#if loaded}
		<p class="name">{$userInfoStore.id}</p>
		<p>WINs : {userInfo.W}</p>
		<p>LOSSes : {userInfo.L}</p>
		<p>DRAWs : {userInfo.D}</p>
		<button on:click={handleSignOut} class="signout">Sign Out</button>
	{:else}
		<img src="./loading.webp" alt="loading" class="center" />
	{/if}
{:else if mode}
	<form on:submit|preventDefault={handleSignin}>
		<p>Sign In</p>
		<input type="text" placeholder="Name" bind:value={idInput} />
		<input type="password" placeholder="Password" bind:value={passwordInput} />
		<button> Sign In </button>
		<button type="button" class="change" on:click={() => (mode = !mode)}>Sign Up</button>
	</form>
{:else}
	<form on:submit|preventDefault={handleSignUp}>
		<p>Sign Up</p>
		<input type="text" placeholder="Name" bind:value={signUpId} />
		<input type="password" placeholder="Password" bind:value={signUpPass} />
		<input type="password" placeholder="Password again" bind:value={passConfirm} />
		<button> Sign Up </button>
		<button type="button" class="change" on:click={() => (mode = !mode)}> Sign In </button>
	</form>
	<p class="small">The password should contain a combination of 6 to 30 letters and numbers.</p>
	<p class="small">No personal infos required.</p>
{/if}

<style>
	p {
		margin: 0 auto;
		width: 20rem;
		text-align: center;
		font-size: 2rem;
	}
	.name {
		font-size: 2rem;
	}
	.small {
		font-size: 1rem;
	}

	form {
		margin: auto;
		display: flex;
		flex-direction: column;
		width: 20rem;
		gap: 1rem;
		border: 1px black solid;
		border-radius: 1rem;
		padding: 1rem;
		background-color: gainsboro;
	}

	input {
		font-size: 20px;
		border: 0;
		border-radius: 1rem;
		padding: 0.5rem;
	}

	button {
		background-color: skyblue;
		border: 0;
		border-radius: 1rem;
		height: 1.5rem;
	}
	.signout {
		display: block;
		margin: 0 auto;
	}
	.change {
		background-color: orange;
	}

	.center {
		display: block;
		margin: 0 auto;
	}
</style>
