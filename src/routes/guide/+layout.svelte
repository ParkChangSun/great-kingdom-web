<script lang="ts">
  const { children } = $props();
</script>

<div class="w-1/2 bg-white p-5 shadow-lg rounded-lg flex flex-col gap-4">
  <h2 class="text-2xl mb-4">그레이트 킹덤 온라인 가이드</h2>
  <div class="flex">
    <nav class="flex flex-col border-r pr-4 mr-4 w-1/5">
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="/guide">📰 공지</a
      >
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="/guide/gameplay">👾 게임 규칙</a
      >
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="/guide/gametable">🎮 테이블 설명</a
      >
      <a
        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        href="/guide/policy">Privacy Policy</a
      >
    </nav>
    <div class="w-4/5">
      {@render children()}
    </div>
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
