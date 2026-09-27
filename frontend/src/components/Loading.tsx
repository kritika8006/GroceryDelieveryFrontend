import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <Loader2 className="w-12 h-12 text-[#1A2E22] animate-spin mb-4" />
      <p className="text-[#1A2E22] font-semibold animate-pulse">Loading your products...</p>
    </div>
  );
};

export default Loading;