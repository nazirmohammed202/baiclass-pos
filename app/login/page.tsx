import Image from "next/image";
import LoginForm from "@/components/loginForm";

const Page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-xl   bg-white dark:bg-neutral-900">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/baiclass.png"
            alt="Baiclass Logo"
            className="w-20 h-20 mb-4"
            width={80}
            height={80}
          />
          <h2 className="text-3xl font-extrabold mb-2 text-center ">
            Baiclass POS
          </h2>
          <p className="text-sm text-center opacity-80 text-foreground">
            Sign in to your account
          </p>
        </div>

        <LoginForm />
        <div className="mt-6 text-center"></div>
      </div>
    </div>
  );
};

export default Page;
