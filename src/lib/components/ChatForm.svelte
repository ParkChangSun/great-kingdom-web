<script lang="ts">
  interface Props {
    send: (msg: string) => void;
    disabled: boolean;
  }
  let { send, disabled }: Props = $props();
  let msg = $state("");

  const submit = (e: Event) => {
    e.preventDefault();
    if (msg === "") {
      return;
    }
    send(msg);
    msg = "";
  };
</script>

<form class="flex" onsubmit={submit}>
  <input
    class="grow-1 p-1 outline-none border-b-2 border-indigo-500 disabled:border-indigo-400 disabled:cursor-not-allowed disabled:bg-gray-200"
    bind:value={msg}
    {disabled}
    placeholder={disabled ? "Connecting..." : "Send chat message"}
  />
  <button
    class="text-white rounded-r-sm px-2 py-1 bg-indigo-500 cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
    type="submit"
    {disabled}
  >
    CHAT
  </button>
</form>

<style lang="postcss">
  @reference "tailwindcss";
</style>
