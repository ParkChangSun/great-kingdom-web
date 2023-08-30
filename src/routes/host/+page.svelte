<script lang="ts">
	import { goto } from '$app/navigation';

	let lobbyName: string;
	let lobbyPassword: string;

	const submitHandler = async () => {
		const res = await fetch('http://localhost:8000/game/create', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				name: lobbyName,
				password: lobbyPassword
			})
		});
		if (res.ok) {
			const { id }: { id: string } = await res.json();
			goto(`/game/${id}`);
		} else {
			console.log(res);
		}
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
