<script lang="ts">
  import "../app.css";
  import icon from "$lib/assets/favicon.png";

  import { page } from "$app/state";
  import { userInfoStore } from "$lib";

  let { children } = $props();

  let nav = $derived([
    { name: "HOME", path: "/" },
    { name: "PLAY", path: "/lobby" },
    { name: "GUIDE", path: "/guide" },
    {
      name: $userInfoStore.Authorized ? "MY PAGE" : "LOG IN",
      path: "/user",
    },
  ]);
</script>

<svelte:head>
  <meta name="rating" content="Safe For Kids" />
  <meta name="robots" content="all" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <meta
    name="description"
    content="이세돌 9단이 개발한 보드게임 '그레이트 킹덤'을 온라인으로 즐겨보세요. 바둑의 전략을 간단하고 흥미롭게 재해석한 이 게임은 초보자부터 전문가까지 모두에게 적합합니다."
  />
  <meta
    name="keywords"
    content="그레이트 킹덤, 이세돌, 보드게임, 바둑, 추상 전략 게임, 온라인 보드게임, 위즈스톤"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header class="flex justify-between">
  <div class="flex justify-center items-center">
    <img src={icon} class="h-8 mx-2" alt="icon" />
    <h1 class="text-5xl">Great Kingdom Online</h1>
  </div>
  <nav class="font-medium text-xl flex p-4 space-x-4">
    {#each nav as n}
      <a
        href={n.path}
        class={[
          page.url.pathname.split("/")[1] === n.path.split("/")[1] &&
            "text-blue-700",
        ]}
      >
        {n.name}
      </a>
    {/each}
  </nav>
</header>

<div class="flex justify-center items-center h-[calc(100vh-3rem)] bg-stone-100">
  {@render children()}
</div>

<style>
  /* font-family: "Noto Sans KR", sans-serif; */
</style>
