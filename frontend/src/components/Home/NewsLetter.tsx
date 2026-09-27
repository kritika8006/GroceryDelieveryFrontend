import { MailIcon } from "lucide-react";

const Newsletter = () => {
  return (
    // yahan bg-stone-50 aur border-stone-200 add kiya hai
    <section className="bg-stone-50 border border-stone-200 py-18 px-4 sm:px-6 lg:px-8 rounded-3xl mx-auto shadow-sm mt-32 mb-20">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon Container */}
        <div className="size-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow">
          <MailIcon className="size-8 text-green-700" strokeWidth={1.5} />
        </div>
        
        {/* Heading & Subtitle */}
        <h2 className="text-3xl font-semibold text-green-800 mb-4">
          Subscribe to our Newsletter
        </h2>
        <p className="text-gray-500 mb-8 text-base">
          Get weekly updates on fresh produce, seasonal offers, and exclusive discounts right to your inbox.
        </p>

        {/* Subscription Form */}
        <form 
          onSubmit={(e) => e.preventDefault()} 
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input 
            type="email" 
            placeholder="Enter your email address" 
            required
            className="flex-1 px-5 py-3.5 rounded-xl border border-stone-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-white text-sm transition-all"
          />
          <button 
            type="submit" 
            className="px-8 py-3.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors shadow-sm whitespace-nowrap active:scale-[0.98]"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;