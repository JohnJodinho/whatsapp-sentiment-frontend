import React from "react";

export function UploadPageRoot({ children }: { children: React.ReactNode }) {
  return (
    <main
      role="main"
      className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="scale-[0.9] sm:scale-[1] md:scale-[1] lg:scale-[1.05] xl:scale-[1.1] transition-transform duration-300 origin-top">
        {children}
      </div>
    </main>
  );
}
