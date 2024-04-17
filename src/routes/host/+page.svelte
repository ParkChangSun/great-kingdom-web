<script lang="ts">
	import { goto } from '$app/navigation';

	let lobbyName: string;
	let lobbyPassword: string;

	const submitHandler = async () => {
		const res = await fetch('https://loiaxfq0s1.execute-api.us-east-1.amazonaws.com/Prod/game', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				name: lobbyName,
				password: lobbyPassword,
				GameSessionName: lobbyName
			})
		});
		// if (res.ok) {
		// 	const { id }: { id: string } = await res.json();
		// 	goto(`/game/${id}`);
		// } else {
		// 	console.log(res);
		// }
		console.log(res);
	};
</script>

<form on:submit|preventDefault={submitHandler}>
	<label>name:<input type="text" placeholder="" bind:value={lobbyName} /></label>
	<label>password:<input type="text" placeholder="" bind:value={lobbyPassword} /></label>
	<button>create</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
