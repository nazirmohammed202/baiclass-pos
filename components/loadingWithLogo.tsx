import Image from "next/image";

const LoadingWithLogo = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          <div className="relative">
            <Image
              src="/baiclass.png"
              alt="Baiclass Logo"
              className="w-24 h-24 animate-pulse"
              width={96}
              height={96}
            />
          </div>
        </div>

        {/* Loading text with spinner */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl font-bold text-foreground/80">
              Baiclass POS
            </p>
            <p className="text-lg font text-foreground/80">Loading...</p>
          </div>
          {/* Pulse spinner dots */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse [animation-delay:0ms]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse [animation-delay:200ms]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse [animation-delay:400ms]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingWithLogo;
