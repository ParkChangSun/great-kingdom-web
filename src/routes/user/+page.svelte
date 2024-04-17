<script lang="ts">
	import { userInfoStore } from '$lib';

	let idInput: string;
	let passwordInput: string;

	const handleSignin = async () => {
		const res = await fetch('https://loiaxfq0s1.execute-api.us-east-1.amazonaws.com/Prod/signin', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				Id: idInput,
				Password: passwordInput
			})
		});
		if (res.ok) {
			res.json().then((v) => {
				userInfoStore.set({ id: v.Id });
			});
		} else {
			alert('login failed');
		}
	};

	let signUpId: string;
	let signUpPass: string;
	let passConfirm: string;

	const handleSignUp = async () => {
		const res = await fetch('https://akb3ys35m5.execute-api.us-east-1.amazonaws.com/Prod/signup', {
			method: 'POST',
			credentials: 'omit',
			body: JSON.stringify({
				Id: signUpId,
				Password: signUpPass
			})
		});
		if (res.ok) {
			alert('Sign Up Success');
		} else {
			alert('Sign Up Failed');
		}
	};
</script>

{#if $userInfoStore.id !== ''}
	<p>Hello {$userInfoStore.id}</p>
{:else}
	<form on:submit|preventDefault={handleSignin}>
		<p>Sign In</p>
		<input type="text" placeholder="Name" bind:value={idInput} />
		<input type="password" placeholder="Password" bind:value={passwordInput} />
		<button> Sign In </button>
	</form>
	<hr />
	<form on:submit|preventDefault={handleSignUp}>
		<p>Sign Up</p>
		<input type="text" placeholder="Name" bind:value={signUpId} />
		<input type="password" placeholder="Password" bind:value={signUpPass} />
		<input type="password" placeholder="Password again" bind:value={passConfirm} />
		<button> Sign Up </button>
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
</style>
