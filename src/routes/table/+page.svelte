<script lang="ts">
  import { onDestroy, tick } from "svelte";
  import { userInfoStore, WebSocketManager, WS_URL } from "$lib";
  import { beforeNavigate, goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { browser, building } from "$app/environment";
  import SpanBox from "$lib/components/SpanBox.svelte";
  import ChatForm from "$lib/components/ChatForm.svelte";
  import Popup from "$lib/components/Popup.svelte";

  const alphabet = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", ""];
  const cellColor = [
    "bg-white-300",
    "bg-slate-300",
    "bg-blue-300",
    "bg-orange-300",
    "bg-violet-300",
    "bg-yellow-300",
    "bg-red-300",
  ];

  interface GameSession {
    Id: string;
    Name: string;
    Connections: {
      UserId: string;
    }[];
    Players: {
      Id: string;
      RemainingTime: number;
    }[];
    CoinToss: number;
    LastMoveTime: number;
    GameTable: {
      Board: number[][];
      Record: {
        Cell: { R: number; C: number };
        Pass: boolean;
      }[];
      Result: string;
    };
  }
  let session: GameSession = $state({
    Id: "",
    Name: "",
    Connections: [],
    Players: [],
    CoinToss: 0,
    LastMoveTime: 0,
    GameTable: {
      Board: Array(9).fill(Array(9).fill(0)),
      Record: [],
      Result: "initstate",
    },
  });

  let turn = $derived(session.GameTable.Record.length + 1);

  let players = $derived([
    "Players",
    ...Array.from(session.Players, (p) => p.Id),
    "Users",
    ...Array.from(session.Connections, (c) => c.UserId),
  ]);
  let record = $derived([
    ...Array.from(session.GameTable.Record, (r, i) =>
      r.Pass
        ? `${i + 1}. Pass`
        : `${i + 1}. ${alphabet[r.Cell.C + 1]}${r.Cell.R + 1}`
    ),
    session.GameTable.Result,
  ]);
  let lastMove = $derived(session.GameTable.Record[turn - 2]);

  let chat: string[] = $state([]);
  let activeTab = $state(0);

  let blueIndex = $derived(session.CoinToss % 2);
  let orangeIndex = $derived((session.CoinToss + 1) % 2);
  let kickable = $state(false);
  let blueTime = $state(0);
  let orangeTime = $state(0);
  let blueTimeFormat = $derived(
    `${Math.floor(blueTime / 60000)}:${String(
      Math.floor((blueTime % 60000) / 1000)
    ).padStart(2, "0")}`
  );
  let orangeTimeFormat = $derived(
    `${Math.floor(orangeTime / 60000)}:${String(
      Math.floor((orangeTime % 60000) / 1000)
    ).padStart(2, "0")}`
  );
  let timer: number;

  const handler = (data: any) => {
    chat = [...chat, data.Chat];
    session = Object.assign(session, data.GameSession);

    kickable = false;
    clearInterval(timer);

    if (session.GameTable && playing) {
      blueTime = session.Players[blueIndex].RemainingTime;
      orangeTime = session.Players[orangeIndex].RemainingTime;

      timer = setInterval(() => {
        if (turn % 2 === 1) {
          blueTime =
            session.Players[blueIndex].RemainingTime -
            (Date.now() - session.LastMoveTime);
        } else {
          orangeTime =
            session.Players[orangeIndex].RemainingTime -
            (Date.now() - session.LastMoveTime);
        }
        if (blueTime <= 0 || orangeTime <= 0) {
          kickable = true;
          clearInterval(timer);
        }
      }, 1000);
    }
  };

  const wsm = new WebSocketManager(
    `${WS_URL}?GameTableId=${!building ? $page.url.searchParams.get("tableId") : ""}&UserId=${$userInfoStore.Id}`,
    handler
  );
  const unsub = userInfoStore.subscribe(async (v) => {
    if (!v.Authorized) {
      browser && goto("/lobby");
      return;
    }

    wsm.connect();
  });
  let wsAuthed = wsm.getAuthorized();

  onDestroy(() => {
    wsm.cleanUp();
    unsub();
  });

  beforeNavigate((e) => {
    if (
      !wsm.isClosed() &&
      playing &&
      isUserPlayer &&
      !confirm("Do you want to leave this game?")
    ) {
      e.cancel();
    }
  });

  const startGame = () => {
    wsm.send({ action: "table", EventType: 2 });
  };
  const doSingleMove = (r: Number, c: Number) => {
    wsm.send({
      action: "table",
      EventType: 3,
      Cell: { R: r, C: c },
    });
  };
  const doPassMove = () => {
    wsm.send({ action: "table", EventType: 3, Pass: true });
  };
  const resign = () => {
    wsm.send({ action: "table", EventType: 3, Resign: true });
  };
  const movePlayerSlot = () => {
    wsm.send({ action: "table", EventType: 4 });
  };
  const kick = () => {
    wsm.send({ action: "table", EventType: 5 });
  };

  let currentTurnPlayerIndex = $derived((turn + session.CoinToss + 1) % 2);
  let playing = $derived(session.GameTable.Result === "");
  let isUserPlayer = $derived(
    Array.from(session.Players, (p) => p.Id).includes($userInfoStore.Id)
  );

  // 코인토스 홀수라서 1번이 선공인데 둘다 주황색임
  let firstPlayerColor = $derived(
    playing
      ? session.CoinToss % 2 === 0
        ? currentTurnPlayerIndex === 0
          ? "bg-blue-500"
          : "bg-gray-500"
        : currentTurnPlayerIndex === 0
          ? "bg-orange-500"
          : "bg-gray-500"
      : "bg-gray-500"
  );
  let secondPlayerColor = $derived(
    playing
      ? session.CoinToss % 2 === 0
        ? currentTurnPlayerIndex === 0
          ? "bg-gray-500"
          : "bg-orange-500"
        : currentTurnPlayerIndex === 0
          ? "bg-gray-500"
          : "bg-blue-500"
      : "bg-gray-500"
  );
  let tableBorder = $derived(
    playing
      ? turn % 2 === 1
        ? " border-blue-500"
        : " border-orange-500"
      : " border-gray-500"
  );
  let isUserTurn = $derived(
    session.Players.length > 0 &&
      playing &&
      $userInfoStore.Id === session.Players[currentTurnPlayerIndex].Id
  );
  let startable = $derived(
    session.Players[0]?.Id === $userInfoStore.Id &&
      session.Players.length === 2 &&
      !playing
  );
</script>

{#snippet slatebutton(onclick: () => void, disabled: boolean, text: string)}
  <button
    {onclick}
    {disabled}
    class="grow-1 rounded-lg text-white cursor-pointer bg-slate-500 hover:bg-slate-600 active:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
  >
    {text}
  </button>
{/snippet}

{#snippet index(i: string | number)}
  <div class="flex justify-center items-center"><span>{i}</span></div>
{/snippet}

<div class="flex gap-2">
  <div class="flex flex-col">
    <div class={`flex justify-between p-2 ${firstPlayerColor}`}>
      <span class="text-white">
        👑 {session.Players.length > 0 ? session.Players[0].Id : "EMPTY"}
      </span>
      <span class="text-white">
        {session.CoinToss % 2 === 0 ? blueTimeFormat : orangeTimeFormat}
      </span>
    </div>
    <div
      class={`grid grid-rows-[15px_repeat(9,_1fr)_15px] grid-cols-[15px_repeat(9,_1fr)_15px] gap-2 border-4 p-2 ${tableBorder}`}
    >
      {#each alphabet as i}
        {@render index(i)}
      {/each}
      {#each Array(9).keys() as r}
        {@render index(r + 1)}
        {#each Array(9).keys() as c}
          {@const bg = session.GameTable?.Board
            ? cellColor[session.GameTable?.Board[r][c]]
            : "slate"}
          <button
            class={[
              `flex justify-center items-center size-8 border-1`,
              `${isUserTurn && session.GameTable.Board[r][c] === 0 ? "bg-gray-100 hover:bg-gray-200" : cellColor[session.GameTable?.Board[r][c]]}`,
            ]}
            disabled={!(isUserTurn && session.GameTable.Board[r][c] === 0)}
            onclick={() => doSingleMove(r, c)}
          >
            {#if lastMove && !lastMove.Pass && lastMove.Cell.R === r && lastMove.Cell.C === c}
              <div class="rounded-full size-4 bg-green-500"></div>
            {/if}
          </button>
        {/each}
        {@render index(r + 1)}
      {/each}
      {#each alphabet as i}
        {@render index(i)}
      {/each}
    </div>
    <div class={`flex justify-between p-2 ${secondPlayerColor}`}>
      <span class="text-white">
        🕹️ {session.Players.length > 1 ? session.Players[1].Id : "EMPTY"}
      </span>
      <span class="text-white">
        {session.CoinToss % 2 === 0 ? orangeTimeFormat : blueTimeFormat}
      </span>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    {@render slatebutton(
      doPassMove,
      !isUserTurn,
      playing && lastMove?.Pass ? "Count" : "Pass"
    )}
    {@render slatebutton(resign, !isUserTurn, "Resign")}
  </div>

  <div class="flex flex-col gap-2 w-md">
    <div class="grow-1 flex flex-col">
      <div class="flex">
        <button
          class={`rounded-tl-lg border-indigo-500 border-t-2 border-l-2 w-1/2 cursor-pointer ${activeTab === 0 && "bg-indigo-500 text-white"}`}
          onclick={() => (activeTab = 0)}>RECORD</button
        >
        <button
          class={`rounded-tr-lg border-indigo-500 border-t-2 border-r-2 w-1/2 cursor-pointer ${activeTab === 1 && "bg-indigo-500 text-white"}`}
          onclick={() => (activeTab = 1)}>PLAYERS</button
        >
      </div>
      {#if activeTab === 0}
        <SpanBox list={record} tailwind={"grow-1 h-0"} />
      {:else}
        <SpanBox list={players} tailwind={"grow-1 h-0"} />
      {/if}
    </div>
    <SpanBox list={chat} tailwind={"grow-1 h-0"} />
    <ChatForm
      send={(msg: string) => wsm.send({ action: "chat", Chat: msg })}
      disabled={!$wsAuthed}
    />
    <div class="flex gap-2">
      {#if kickable}
        {@render slatebutton(kick, !playing || isUserTurn, "Kick AFK")}
      {:else}
        {@render slatebutton(startGame, !startable, "Start")}
      {/if}
      {@render slatebutton(
        movePlayerSlot,
        playing,
        isUserPlayer ? "Spectate" : "Play"
      )}
      {@render slatebutton(() => goto("/lobby"), false, "Leave")}
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
