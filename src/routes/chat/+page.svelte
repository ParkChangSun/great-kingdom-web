<script lang="ts">
	import { onMount } from 'svelte';

	let chat: string[] = [];
	let chatDiv: HTMLDivElement;
	$: if (chat.length > 0) {
		chatDiv.scroll({ top: chatDiv.scrollHeight });
	}

	let socket: WebSocket;

	onMount(() => {
		socket = new WebSocket(`wss://websocket.greatkingdom.net?GameSessionId=global`);
		socket.addEventListener('open', () => {
			console.log('Opened');
		});
		socket.addEventListener('close', (e) => {
			console.log(e);
		});
		socket.addEventListener('error', (e) => {
			console.log(e);
		});
		socket.addEventListener('message', (e) => {
			const data = JSON.parse(e.data);
			chat = [...chat, data.Chat];
		});
	});

	let chatInput: string;
	const sendChat = async () => {
		socket.send(JSON.stringify({ action: 'globalchat', Chat: chatInput }));
		chatInput = '';
	};
</script>

<div bind:this={chatDiv} class="chat">
	{#each chat as c}
		<li>{c}</li>
	{/each}
</div>
<form on:submit|preventDefault={sendChat}>
	<input bind:value={chatInput} /><button type="submit" />
</form>
