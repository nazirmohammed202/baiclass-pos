"use client";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <button
        type="submit"
        onClick={() => {
          router.push("/login");
        }}
      >
        Login
      </button>
    </div>
  );
};

export default Page;
