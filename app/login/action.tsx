"use server";

import api from "@/config/api";
import { handleError } from "@/utils/errorHandlers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const loginAction = async (prevState: unknown, formData: FormData) => {
  try {
    const emailOrPhone = formData.get("emailOrPhone") as string;
    const password = formData.get("password") as string;

    const { data } = await api.post("/accounts/read/login", {
      medium: emailOrPhone,
      password,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    (await cookies()).set("__baiclass", data, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
    });
  } catch (error) {
    return { error: handleError(error) };
  }

  redirect("/select-branch");
};
