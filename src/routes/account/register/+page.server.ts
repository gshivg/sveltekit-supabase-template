import type { PageServerLoad, Actions } from "./$types.js";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";
import { UserDatabase } from '$lib/database/user.database';
import type { Tables } from "$lib/types/supabase.js";

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
    const { username, email, password, confirmPassword } = form.data;

    const userEmail = await UserDatabase.getByEmail(email);
    const userUsername = await UserDatabase.getByUsername(username);

    if (userEmail) {
      setError(form, 'email', 'Email is already in use')
      return fail(400, { form });
    } else if (userUsername) {
      setError(form, 'username', 'Username is already in use')
      return fail(400, { form });
    } else if (password != confirmPassword) {
      setError(form, 'password', 'Passwords do not match')
      setError(form, 'confirmPassword', 'Passwords do not match')
      return fail(400, { form });
    }

    let user: Tables<'users'> | null = null;

    const { data, error: error } = await supabase.auth.signUp({ email, password });

    if (data && data.user && data.user.email && data.user.user_metadata.email) {
      user = await UserDatabase.insert({
        id: data.user.id,
        email: data.user.email,
        username: data.user.email,
        profile_image: 'default-avatar.jpg',
        role: 'user'
      });
    }

    if (error || user == null) {
      if (data && data.user) {
        await supabase.auth.admin.deleteUser(data.user.id);
      }
      return redirect(303, '/errors');
    } else {
      throw redirect(303, '/dashboard');
    }
  },
};
