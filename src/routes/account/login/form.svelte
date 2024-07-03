<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { toast } from "svelte-sonner";
  import { Circle } from "svelte-loading-spinners";
  import { formSchema, type FormSchema } from "./schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<FormSchema>>;

  let isSubmitting = false;

  const form = superForm(data, {
    validators: zodClient(formSchema),
    onResult({ result, formElement, cancel }) {
      isSubmitting = false;
      if (result.type === "failure") {
        console.log(result.data!.form.errors);
        if (result.data!.form.errors.username[0]) {
          toast.error(result.data!.form.errors.username[0]);
        }
        if (result.data!.form.errors.email[0]) {
          toast.error(result.data!.form.errors.email[0]);
        }
        if (result.data!.form.errors.password[0]) {
          toast.error(result.data!.form.errors.password[0]);
        }
      } else if (result.type === "error") {
        toast.error("Something went wrong");
      } else {
        toast.success("Account Created");
      }
    },
    onSubmit() {
      isSubmitting = true;
    },
  });

  const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
  <Form.Field {form} name="email">
    <Form.Control let:attrs>
      <Form.Label>Email</Form.Label>
      <Input {...attrs} bind:value={$formData.email} />
    </Form.Control>
    <Form.Description>This is your Email.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="password">
    <Form.Control let:attrs>
      <Form.Label>Password</Form.Label>
      <Input {...attrs} bind:value={$formData.password} />
    </Form.Control>
    <Form.Description>Enter a strong password.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button class="w-full flex items-center justify-center gap-2">
    {#if isSubmitting}
      <Circle size="20" color="#FFFFFF" unit="px" duration="1s" />
    {/if}
    Submit
  </Form.Button>
</form>
