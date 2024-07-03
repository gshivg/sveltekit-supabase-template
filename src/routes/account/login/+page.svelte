<script lang="ts">
  import Form from "./form.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<div class="h-screen w-screen flex items-center justify-center">
  <Form data={data.form} />
</div>
