import { useState } from "react";
import { TruckIcon, XIcon, Zap } from "lucide-react";

const Banner = () => {
  const [bannerVisible, setBannerVisible] = useState(() => {
    return sessionStorage.getItem("bannerDismissed") !== "true";
  });

  const dismissBanner = () => {
    setBannerVisible(false);
    sessionStorage.setItem("bannerDismissed", "true");
  };

  return (
    <div>
      {bannerVisible && (
        // Changed bg-[#051C12] to Navy Blue (#1e3a8a)
        <div className="bg-[#1e3a8a] text-white py-2 px-4 flex items-center justify-between text-xs md:text-sm">
          
          <div className="flex-1 flex justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <TruckIcon className="size-4 shrink-0" />
              <span className="font-medium">Free delivery on orders over $20</span>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="size-4 shrink-0 text-yellow-400" />
              <span className="font-medium">Farm-fresh produce delivered daily</span>
            </div>
          </div>

          {/* Added hover transition and scale effect */}
          <button
            onClick={dismissBanner}
         className="text-blue-200 hover:text-white transition-colors"
>
            <XIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner;