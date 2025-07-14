<script lang="ts">
  import {
    userInfoStore,
    authorizedApi,
    unauthorizedApi,
    type Authorization,
  } from "$lib";
  import { isAxiosError } from "axios";

  const alphabet = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", ""];

  type UserInfo = {
    Id: string;
    W: number;
    L: number;
    RecentGames: {
      BlueId: string;
      OrangeId: string;
      Result: string;
    }[];
  };

  const getUserInfo = async () => {
    try {
      const p = await authorizedApi.get<UserInfo>(
        `/user?UserId=${$userInfoStore.Id}`
      );
      return p.data;
    } catch (error) {
      throw new Error("error getuserinfo");
    }
  };
  let getUserPromise = $derived(
    $userInfoStore.Authorized ? getUserInfo() : null
  );

  let signInId = $state("");
  let signInPass = $state("");
  let signInMessage = $state("");

  let authPromise: Promise<void> | null = $state(null);
  const handleSignin = async () => {
    if (signInId === "" || signInPass === "") {
      signInMessage = "입력이 올바르지 않습니다";
      return;
    }

    try {
      const res = await unauthorizedApi.post<Authorization>("/sign-in", {
        Id: signInId,
        Password: signInPass,
      });
      userInfoStore.set(res.data);
    } catch (error) {
      if (isAxiosError(error)) {
        signInMessage = error.response?.data.message;
      } else console.log(error);
    }
  };

  let signUpId = $state("");
  let signUpPass = $state("");
  let signUpPassConfirm = $state("");
  let signUpMessage = $state("");

  const handleSignUp = async () => {
    if (
      signUpId === "" ||
      signUpPass === "" ||
      signUpPass !== signUpPassConfirm
    ) {
      signUpMessage = "입력이 올바르지 않습니다";
      return;
    }

    try {
      const res = await unauthorizedApi.post("/sign-up", {
        Id: signUpId,
        Password: signUpPass,
      });
      alert("Sign Up Success");
      mode = "signin";
    } catch (error) {
      if (isAxiosError(error)) {
        signUpMessage = error.response?.data.message;
      } else if (error instanceof Error) console.log(error);
    }

    signUpId = "";
    signUpPass = "";
    signUpPassConfirm = "";
  };

  const handleSignOut = async () => {
    try {
      const res = await authorizedApi.post<Authorization>("/sign-out");
      userInfoStore.set(res.data);
    } catch (error) {
      userInfoStore.set({ Authorized: false, Id: "", AccessToken: "" });
      if (error instanceof Error) console.log(error);
    }
  };

  const deleteUser = async () => {
    try {
      if (!confirm("Are you sure you want to delete the data?")) {
        return;
      }
      const res = await authorizedApi.post<Authorization>("/user", {
        Id: $userInfoStore.Id,
      });
      alert("delete success");
      userInfoStore.set(res.data);
    } catch (error) {
      if (error instanceof Error) console.log(error);
    }
  };

  interface Record {
    PlayerId: string;
    Time: string;
    PlayersId: string[];
    Board: number[][];
    Record: {
      Cell: {
        R: number;
        C: number;
      };
      Pass: boolean;
    }[];
    Result: string;
  }
  interface RecordQuery {
    StartKey: string;
    Records: Record[];
  }

  let records: Record[] = $state([]);
  let startKey = "";

  const getRecords = async () => {
    try {
      const res = await authorizedApi.get<RecordQuery>(
        `/records?UserId=${$userInfoStore.Id}&StartKey=${startKey}`
      );
      records.push(...res.data.Records);
      startKey = res.data.StartKey;
    } catch (error) {
      if (error instanceof Error) console.log(error);
    }
  };
  let getRecordsProm: Promise<void> | null = $derived(
    $userInfoStore.Authorized ? getRecords() : null
  );

  let mode = $derived($userInfoStore.Authorized ? "user" : "signin");
</script>

<svelte:head>
  <title
    >{$userInfoStore.Authorized ? $userInfoStore.Id : "홈"} - 그레이트 킹덤 온라인</title
  >
</svelte:head>

<div class="w-1/2 bg-white p-5 shadow-lg rounded-lg flex flex-col gap-4">
  {#if mode === "signin"}
    <div class="flex">
      <button
        class={`w-1/2 border-b-2 border-indigo-500 rounded-t-lg py-2 cursor-pointer ${mode === "signin" && "bg-indigo-500 text-white"}`}
        onclick={() => (mode = "signin")}
      >
        로그인
      </button>
      <button
        class={`w-1/2 border-b-2 border-indigo-500 rounded-t-lg py-2 cursor-pointer`}
        onclick={() => (mode = "signup")}
      >
        가입
      </button>
    </div>
    <form
      class="flex flex-col items-center"
      onsubmit={() => (authPromise = handleSignin())}
    >
      <div class="relative w-1/2 mt-6">
        <input
          id="id"
          class="peer w-full border-b-2 border-gray-300 bg-transparent px-2 py-1 focus:outline-none focus:border-indigo-500"
          bind:value={signInId}
          placeholder=""
        />
        <label
          for="id"
          class="absolute text-gray-500 left-2 -top-5 transform duration-100 peer-focus:text-indigo-500 peer-focus:-top-5 peer-placeholder-shown:top-1"
          >ID</label
        >
      </div>
      <div class="relative w-1/2 mt-6">
        <input
          id="pass"
          class="peer w-full border-b-2 border-gray-300 bg-transparent px-2 py-1 focus:outline-none focus:border-indigo-500"
          type="password"
          bind:value={signInPass}
          placeholder=" "
        />
        <label
          for="pass"
          class="absolute text-gray-500 left-2 -top-5 transform duration-100 peer-focus:text-indigo-500 peer-focus:-top-5 peer-placeholder-shown:top-1"
          >PASSWORD</label
        >
      </div>
      {#if signInMessage !== ""}
        <p class="error">{signInMessage}</p>
      {/if}
      <button
        class="rounded-lg text-white bg-indigo-500 w-1/4 py-2 mt-6 hover:bg-indigo-700"
        type="submit"
      >
        {#await authPromise}
          ⏳
        {:then v}
          로그인
        {/await}
      </button>
    </form>
  {:else if mode === "signup"}
    <div class="flex">
      <button
        class={`w-1/2 border-b-2 border-indigo-500 rounded-t-lg py-2 cursor-pointer`}
        onclick={() => (mode = "signin")}
      >
        로그인
      </button>
      <button
        class={`w-1/2 border-b-2 border-indigo-500 rounded-t-lg py-2 cursor-pointer ${mode === "signup" && "bg-indigo-500 text-white"}`}
        onclick={() => (mode = "signup")}
      >
        가입
      </button>
    </div>
    <form
      class="flex flex-col items-center"
      onsubmit={() => (authPromise = handleSignUp())}
    >
      <div class="relative w-1/2 mt-6">
        <input
          id="id"
          class="peer w-full border-b-2 border-gray-300 bg-transparent px-2 py-1 focus:outline-none focus:border-indigo-500"
          bind:value={signUpId}
          placeholder=""
        />
        <label
          for="id"
          class="absolute text-gray-500 left-2 -top-5 transform duration-100 peer-focus:text-indigo-500 peer-focus:-top-5 peer-placeholder-shown:top-1"
          >ID</label
        >
        <span class="text-sm text-gray-500"
          >아이디 : 특수기호 없는 영문/숫자 4-15 글자</span
        >
      </div>
      <div class="relative w-1/2 mt-6">
        <input
          id="pass"
          class="peer w-full border-b-2 border-gray-300 bg-transparent px-2 py-1 focus:outline-none focus:border-indigo-500"
          type="password"
          bind:value={signUpPass}
          placeholder=" "
        />
        <label
          for="pass"
          class="absolute text-gray-500 left-2 -top-5 transform duration-100 peer-focus:text-indigo-500 peer-focus:-top-5 peer-placeholder-shown:top-1"
          >PASSWORD</label
        >
        <span class="text-sm text-gray-500"
          >비밀번호 : 영문+숫자 6-30 글자 (포함가능 : @#$%^&*)</span
        >
      </div>
      <div class="relative w-1/2 mt-6">
        <input
          id="repeat"
          class="peer w-full border-b-2 border-gray-300 bg-transparent px-2 py-1 focus:outline-none focus:border-indigo-500"
          type="password"
          bind:value={signUpPassConfirm}
          placeholder=" "
        />
        <label
          for="repeat"
          class="absolute text-gray-500 left-2 -top-5 transform duration-100 peer-focus:text-indigo-500 peer-focus:-top-5 peer-placeholder-shown:top-1"
          >REPEAT PASSWORD</label
        >
      </div>
      {#if signUpMessage !== ""}
        <p class="text-red mt-6">{signUpMessage}</p>
      {/if}
      <button
        class="rounded-lg text-white bg-indigo-500 w-1/4 py-2 mt-6 hover:bg-indigo-700"
      >
        {#await authPromise}
          ⏳
        {:then v}
          가입
        {/await}
      </button>
    </form>
  {:else}
    {#await getUserPromise}
      <p class="text-center">⏳</p>
    {:then u}
      {#if u}
        <div class="flex justify-between">
          <h2 class="text-2xl">{u.Id}</h2>
          <button
            onclick={handleSignOut}
            class="text-white bg-red-500 hover:bg-red-600 cursor-pointer px-2"
          >
            Sign Out
          </button>
        </div>
        <p>
          <span class="text-blue-500">{u.W}W</span>
          <span class="text-red-500">{u.L}L</span>
          <span class="text-indigo-500">
            {u.W !== 0
              ? Math.round((u.W / (u.W + u.L)) * 10000) / 100
              : "0.00"}% WL
          </span>
        </p>
        <h2 class="text-xl">Records</h2>
        <div class="flex flex-col overflow-y-auto max-h-80 gap-4">
          {#each records as r}
            <div class="flex flex-col">
              <div>
                <span class="text-blue-500">{r.PlayersId[0]}</span>
                <span>VS</span>
                <span class="text-orange-500">{r.PlayersId[1]}</span>
                <span>{r.Time}</span>
              </div>
              <div class="flex gap-4">
                {#each r.Record as m}
                  {#if m.Pass}
                    <span class="odd:text-blue-500 even:text-orange-500"
                      >Pass</span
                    >
                  {:else}
                    <span class="odd:text-blue-500 even:text-orange-500"
                      >{alphabet[m.Cell.C]}{m.Cell.R}</span
                    >
                  {/if}
                {/each}
              </div>
              <span>{r.Result}</span>
            </div>
          {/each}
          {#await getRecordsProm}
            loading
          {:then v}
            <button
              class="cursor-pointer"
              onclick={() => (getRecordsProm = getRecords())}>MORE</button
            >
          {/await}
        </div>
        <button
          class="text-white bg-red-500 hover:bg-red-600 cursor-pointer px-2 w-1/5"
          onclick={deleteUser}>Delete User</button
        >
      {:else}
        <span>internal promise error</span>
      {/if}
    {:catch e}
      <p>{e.message}</p>
    {/await}
  {/if}
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
