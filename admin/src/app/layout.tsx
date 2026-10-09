import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Raani Closet | Atelier Command",
  description: "Admin Panel for Raani Closet",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for (var i = 0; i < registrations.length; i++) {
                        registrations[i].unregister();
                      }
                    });
                  }
                  if (typeof window !== 'undefined' && 'caches' in window) {
                    caches.keys().then(function(names) {
                      for (var j = 0; j < names.length; j++) {
                        caches.delete(names[j]);
                      }
                    });
                  }
                  if (typeof window !== 'undefined' && 'indexedDB' in window) {
                    try { window.indexedDB.deleteDatabase('workbox-expiration'); } catch(e) {}
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#FAFAFA] text-[#1A1A1A] antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

