<script lang="ts">
	import { goto } from '$app/navigation';
	import { userInfoStore, API_URL, refreshToken } from '$lib';

	type UserInfo = {
		W: number;
		L: number;
		D: number;
	};
	let userInfo: UserInfo = { W: 0, L: 0, D: 0 };
	let loaded = false;

	$: if ($userInfoStore.id !== '') {
		loaded = false;

		fetch(`${$API_URL}/user?UserId=${$userInfoStore.id}`, {
			method: 'GET',
			credentials: 'include'
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				} else if (Math.floor(res.status / 100) === 4) {
					const valid = refreshToken();
					if (!valid) {
						userInfoStore.set({ authorized: false, id: '' });
						alert('login!');
						goto('/user');
					}
				} else {
					throw new Error(res.status.toString());
				}
			})
			.then((res) => {
				userInfo = res;
				loaded = true;
			})
			.catch((e) => console.log(e));
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
			alert(res.statusText);
		}
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
			alert('Sign Up Failed');
		}
	};

	const handleSignOut = async () => {
		await fetch(`${$API_URL}/signout`, {
			method: 'POST',
			credentials: 'include'
		});
		userInfoStore.set({ authorized: false, id: '' });
	};

	let mode = false;
</script>

{#if $userInfoStore.id !== ''}
	<p>Hello {$userInfoStore.id}</p>
	<p>WINs : {userInfo.W}</p>
	<p>LOSSes : {userInfo.L}</p>
	<p>DRAWs : {userInfo.D}</p>
	<button on:click={handleSignOut} class="signout">Sign Out</button>
{:else}
	<form on:submit|preventDefault={handleSignin}>
		<p>Sign In</p>
		<input type="text" placeholder="Name" bind:value={idInput} />
		<input type="password" placeholder="Password" bind:value={passwordInput} />
		<button> Sign In </button>
		<button type="button" on:click={() => (mode = !mode)}>Sign Up</button>
	</form>
	<hr />
	<form on:submit|preventDefault={handleSignUp}>
		<p>Sign Up</p>
		<input type="text" placeholder="Name" bind:value={signUpId} />
		<input type="password" placeholder="Password" bind:value={signUpPass} />
		<input type="password" placeholder="Password again" bind:value={passConfirm} />
		<button> Sign Up </button>
		<button type="button" on:click={() => (mode = !mode)}> Sign In </button>
	</form>
{/if}

<style>
	p {
		margin: 0 auto;
		width: 20rem;
		text-align: center;
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

	hr {
		width: 24rem;
		margin: 2rem auto;
	}

	button {
		background-color: aqua;
		border: 0;
		border-radius: 1rem;
		height: 1.5rem;
	}
	.signout {
		margin: 0 auto;
	}
</style>
