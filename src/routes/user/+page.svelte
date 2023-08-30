<script lang="ts">
	import { userInfoStore } from '$lib';

	let idInput: string;
	let passwordInput: string;

	const handleSignin = async () => {
		const res = await fetch('http://localhost:8000/auth/signin', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				id: idInput,
				password: passwordInput
			})
		});
		if (res.ok) {
			res.json().then((v) => {
				userInfoStore.set({ id: v.name });
			});
		} else {
			console.log(res.statusText);
		}
	};

	let signUpId: string;
	let signUpPass: string;
	let passConfirm: string;

	const handleSignUp = async () => {
		const res = await fetch('http://localhost:8000/auth/signup', {
			method: 'POST',
			credentials: 'omit',
			body: JSON.stringify({
				id: signUpId,
				password: signUpPass
			})
		});
		if (res.ok) {
			alert(res.statusText);
		} else {
			alert(res.statusText);
		}
	};
</script>

<p>user information page</p>

{#if $userInfoStore.id !== ''}
	<p>Hello <a href="/user">{$userInfoStore.id}</a></p>
{:else}
	<form on:submit|preventDefault={handleSignin}>
		<input type="text" placeholder="Name" bind:value={idInput} />
		<input type="password" placeholder="Password" bind:value={passwordInput} />
		<button> Sign In </button>
	</form>
{/if}

<form on:submit|preventDefault={handleSignUp}>
	<input type="text" placeholder="Name" bind:value={signUpId} />
	<input type="password" placeholder="Password" bind:value={signUpPass} />
	<input type="password" placeholder="Password" bind:value={passConfirm} />
	<button> Sign Up </button>
</form>
