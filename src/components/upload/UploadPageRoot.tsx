import React from "react";

export function UploadPageRoot({ children }: { children: React.ReactNode }) {
  return (
    <main
      role="main"
      // Changed min-h to 100dvh (dynamic viewport)
      // Added pt-24 md:pt-0 to clear navbar on mobile but center on desktop
      // Added overflow-x-hidden to prevent scrollbars from animations
      className="flex flex-col md:flex-row items-center justify-center min-h-[100dvh] pt-24 md:pt-0 pb-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden"
    >
      <div className="w-full max-w-4xl transition-transform duration-300 origin-center">
        {children}
      </div>
    </main>
  );
}