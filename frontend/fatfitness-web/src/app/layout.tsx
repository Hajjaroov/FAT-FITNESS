import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteProviders } from "@/app/_components/SiteProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fat Fitness Community",
  description: "Personal fitness journey and peer support platform.",
  icons: {
    apple: "/icons/icon-apple-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Synchronous theme init — prevents light-mode flash when OS is dark */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('fat-fitness-theme');var t=s==='dark'||s==='light'?s:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
