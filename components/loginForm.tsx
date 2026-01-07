"use client";
import { loginAction } from "@/app/login/action";
import { Eye, EyeOff } from "lucide-react";
import React, { useActionState } from "react";
import { Spinner } from "./ui/spinner";

const LoginForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [state, login, pending] = useActionState(loginAction, undefined);

  return (
    <form className="space-y-6" action={login}>
      <div>
        <label
          htmlFor="emailOrPhone"
          className="block mb-2 text-sm font-medium text-foreground"
        >
          Mobile Number
        </label>
        <input
          type="text"
          id="emailOrPhone"
          name="emailOrPhone"
          placeholder="Enter your phone number"
          className="b-input "
          required
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-medium text-foreground"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter your password"
            className="b-input pr-10"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 dark:text-gray-300 bg-transparent border-none p-0 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <Eye className="w-6 h-6" />
            ) : (
              <EyeOff className="w-6 h-6" />
            )}
          </button>
        </div>

        {state?.error ? (
          <p className="text-red-500 text-sm mt-2">{state.error}</p>
        ) : null}
      </div>

      <button
        type="submit"
        className="btn w-full font-semibold text-lg mt-2 flex items-center justify-center gap-2"
        disabled={pending}
      >
        {pending ? <Spinner className="w-5 h-5 text-white" /> : null}
        Login
      </button>
    </form>
  );
};

export default LoginForm;
