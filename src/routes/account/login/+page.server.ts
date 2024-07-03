import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";
import { AuthApiError } from "@supabase/supabase-js";

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.safeGetSession();
  if (session.user) {
    redirect(303, '/dashboard');
  }
  return {
    form: await superValidate(zod(formSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(formSchema));
    const { locals } = event;
    const { supabase } = locals;
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }
    const { email, password } = form.data;

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.log(error)
      if (error instanceof AuthApiError && error.status === 400) {
        return fail(400, {
          error: 'Invalid username or password'
        });
      }
      return fail(500, {
        message: 'Server error. Try again later.'
      });
    }

    redirect(303, '/dashboard');
  },
};
