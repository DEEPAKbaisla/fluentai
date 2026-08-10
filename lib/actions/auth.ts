"use server";

import { signIn, signOut } from "@/lib/auth";

export async function loginWithCredentials(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Invalid email or password" };
    }

    return { success: true };
  } catch {
    return { error: "Invalid email or password" };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
