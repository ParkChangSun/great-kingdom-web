<script lang="ts">
	import { userInfoStore } from '$lib';

	let idInput: string;
	let passwordInput: string;

	const handleSignin = async () => {
		const res = await fetch('https://akb3ys35m5.execute-api.us-east-1.amazonaws.com/Prod/signin', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				Id: idInput,
				Password: passwordInput
			})
		});
		if (res.ok) {
			// res.json().then((v) => {
			// 	// userInfoStore.set({ id: v.name });
			// 	console.log(v);
			// });
			alert(res.statusText);
		} else {
			alert(res.statusText);
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
			alert(res.statusText);
		} else {
			alert(res.statusText);
		}
	};

	const hello = async () => {
		const res = await fetch('https://akb3ys35m5.execute-api.us-east-1.amazonaws.com/Prod/cookie', {
			method: 'GET',
			credentials: 'include'
		});
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

<button on:click={hello}>cookie</button>

<form on:submit|preventDefault={handleSignUp}>
	<input type="text" placeholder="Name" bind:value={signUpId} />
	<input type="password" placeholder="Password" bind:value={signUpPass} />
	<input type="password" placeholder="Password" bind:value={passConfirm} />
	<button> Sign Up </button>
</form>
