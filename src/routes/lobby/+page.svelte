<script lang="ts">
  import { goto } from "$app/navigation";
  import { authorizedApi, userInfoStore, WebSocketManager, WS_URL } from "$lib";
  import ChatForm from "$lib/components/ChatForm.svelte";
  import Popup from "$lib/components/Popup.svelte";
  import SpanBox from "$lib/components/SpanBox.svelte";
  import { isAxiosError } from "axios";
  import { onDestroy, tick } from "svelte";

  interface GameTable {
    Id: string;
    Name: string;
    Players: {
      Id: string;
    }[];
  }

  let getTablesBtn = $state(false);
  const getGameTables = async () => {
    getTablesBtn = true;
    try {
      let res = await authorizedApi.get<GameTable[]>("/table");
      getTablesBtn = false;
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.response?.data.message);
        throw new Error("log in first");
      } else {
        console.log(error);
        throw new Error("error");
      }
    }
  };
  let getTablesPromise = $state(getGameTables());

  let chatUsers: string[] = $state([]);

  const handler = (data: any) => {
    if (data.EventType === "CHAT") {
      const { Chat }: { Chat: string } = data;
      chat = [...chat, Chat];
    } else if (data.EventType === "USERS") {
      const { Users }: { Users: string[] } = data;
      chatUsers = [`Main Lobby : ${Users.length} online`, ...Users];
    } else {
      console.log(data);
    }
  };

  let chat: string[] = $state([]);

  const wsm = new WebSocketManager(
    `${WS_URL}?GameTableId=globalchat&UserId=${$userInfoStore.Id}`,
    handler
  );
  const unsub = userInfoStore.subscribe((v) => {
    if (!v.Authorized) return;

    wsm.connect();
  });
  let wsAuthed = wsm.getAuthorized();

  onDestroy(() => {
    wsm.cleanUp();
    unsub();
  });

  const send = (msg: string) => {
    wsm.send({ action: "globalchat", Chat: msg });
  };

  let tableNameInput: string = $state("");
  let createTablePromise: Promise<void> | null = $state(null);
  const postCreateTable = async () => {
    try {
      const res = await authorizedApi.post<{ GameTableId: string }>("/table", {
        GameTableName: tableNameInput,
      });
      goto(`/table?tableId=${res.data.GameTableId}`);
    } catch (error) {
      throw new Error("error postcreatetable");
    }
  };
  const createTable = () => {
    if (tableNameInput === "") return;
    createTablePromise = postCreateTable();
  };

  const enterTable = (tableId: string) => {
    if (!$userInfoStore.Authorized) return;
    goto(`/table?tableId=${tableId}`);
  };

  let popupActive = $state(false);
</script>

<svelte:head>
  <title>메인 로비 - 그레이트 킹덤 온라인</title>
</svelte:head>

<div class="w-1/2 bg-white p-5 shadow-lg rounded-lg flex flex-col gap-4">
  <div class="flex justify-between align-center">
    <h2 class="text-2xl">Play Great Kingdom</h2>
    <div class="flex gap-2">
      <button
        class="text-white bg-indigo-500 px-2 hover:bg-indigo-600 cursor-pointer"
        onclick={() => (popupActive = true)}
        disabled={!$userInfoStore.Authorized || getTablesBtn}
      >
        Create Game
      </button>
      <button
        class="text-white bg-indigo-500 px-2 hover:bg-indigo-600 cursor-pointer"
        onclick={() => (getTablesPromise = getGameTables())}
        disabled={getTablesBtn}
      >
        Reload
      </button>
    </div>
  </div>
  {#await getTablesPromise}
    <p class="text-center">⏳</p>
  {:then tables}
    {#if tables.length === 0}
      <p>No game found</p>
    {/if}
    <div class="grid gap-2 grid-cols-[repeat(2,_1fr)]">
      {#each tables as t}
        <button
          class="flex justify-between items-center text-white bg-gradient-to-r from-blue-300 to-blue-500 hover:bg-gradient-to-br font-medium p-4 cursor-pointer"
          onclick={() => enterTable(t.Id)}
        >
          <span class="text-lg">{t.Name}</span>
          <div class="flex flex-col">
            <span>{t.Players.length > 0 ? t.Players[0].Id : "EMPTY"}</span>
            <span>{t.Players.length > 1 ? t.Players[1].Id : "EMPTY"}</span>
          </div>
        </button>
      {/each}
    </div>
  {:catch e}
    <p>{e.message}</p>
  {/await}
  <h2 class="text-2xl">Chat</h2>
  <div class="flex gap-2 h-50">
    <div class="grow-4 flex flex-col gap-2">
      <SpanBox list={chat} tailwind={"grow-1 h-0"} />
      <ChatForm {send} disabled={!$wsAuthed} />
    </div>
    <SpanBox list={chatUsers} tailwind={"grow-1"} />
  </div>

  <Popup {popupActive} tailwind={"flex flex-col p-4 bg-white"}>
    <h2 class="text-xl">Create Game</h2>
    {#await createTablePromise}
      <p class="text-center">⏳</p>
    {:then}
      <form class="flex flex-col gap-2" onsubmit={createTable}>
        <input
          class="outline-none border-1"
          placeholder="Name"
          bind:value={tableNameInput}
        />
        <div class="flex justify-between">
          <button
            class="text-white bg-indigo-500 px-2 hover:bg-indigo-600 cursor-pointer"
            type="submit">Create</button
          >
          <button
            class="text-white bg-red-500 px-2 hover:bg-red-600 cursor-pointer"
            onclick={() => (popupActive = false)}>Close</button
          >
        </div>
      </form>
    {:catch e}
      <p>{e.message}</p>
    {/await}
  </Popup>
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
