import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Stock management",
  description: "Stock management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`relative min-h-screen `}>
        <SessionWrapper>
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
          </div>
          {children}

          {/* Cloudinary Upload Widget */}
          <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="afterInteractive"
          />

          {/* Optional: Only if you're using Cloudinary JS SDK directly */}
          <Script
            src="https://unpkg.com/cloudinary-core/cloudinary-core-shrinkwrap.min.js"
            strategy="afterInteractive"
          />
          <Script src="https://kit.fontawesome.com/0a03637b2b.js" crossOrigin="anonymous"  strategy="afterInteractive"/>
        </SessionWrapper>
      </body>
    </html>
  );
}
