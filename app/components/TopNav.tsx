export function TopNav() {
  return (
    <nav className="flex flex-col inset-x-0 w-full sticky top-0 z-30 bg-[#15191d] border-b border-gray-800">
      <div className="max-w-[1350px] w-full py-3 px-4 lg:px-6 flex gap-4 mx-auto items-center justify-between min-h-[68px]">
        <div className="w-fit shrink-0 h-10 cursor-pointer flex items-center">
          <svg
            viewBox="0 0 911 168"
            fill="none"
            className="h-6.5 w-auto text-white px-2.5 h-6"
          >
            <text
              x="0"
              y="120"
              fill="white"
              fontSize="130"
              fontWeight="bold"
              letterSpacing="-5"
            >
              POLYMARKET
            </text>
          </svg>
        </div>
        <div className="items-center gap-2 w-full hidden lg:flex">
          <div className="lg:max-w-[600px] min-w-[400px] relative w-full">
            <input
              className="flex h-10 w-full rounded-md px-3 py-1 text-sm bg-[#1e2226] text-white border-transparent focus:ring-1 focus:ring-blue-500 outline-none pl-10 transition-shadow"
              placeholder="Search polymarkets..."
            />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path
                  d="M15.75 15.75L11.6386 11.6386"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                ></path>
                <path
                  d="M7.75 13.25C10.7875 13.25 13.25 10.7875 13.25 7.75C13.25 4.7125 10.7875 2.25 7.75 2.25C4.7125 2.25 2.25 4.7125 2.25 7.75C2.25 10.7875 4.7125 13.25 7.75 13.25Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-4 ml-auto">
          <button className="bg-[#1e2226] hover:bg-[#2a2e33] text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors">
            Log In
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors hidden md:block">
            Sign Up
          </button>
        </div>
      </div>
      <div className="max-w-[1350px] w-full flex px-4 lg:px-6 mx-auto overflow-x-auto border-t border-gray-800">
        <div className="flex h-12 items-center gap-2 w-full text-[15px] font-semibold text-gray-400 whitespace-nowrap overflow-x-auto">
          <span className="cursor-pointer hover:text-white px-2">Trending</span>
          <span className="cursor-pointer hover:text-white px-2">Breaking</span>
          <span className="cursor-pointer hover:text-white px-2">New</span>
          <div className="h-3.5 w-0.5 rounded-full bg-gray-700 mx-1 shrink-0"></div>
          <span className="cursor-pointer hover:text-white px-2">Politics</span>
          <span className="cursor-pointer text-white px-2">Sports</span>
          <span className="cursor-pointer hover:text-white px-2">Crypto</span>
        </div>
      </div>
    </nav>
  );
}
