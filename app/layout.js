import "./globals.css";

import { AppContextProvider } from "../lib/AppContext";

export const metadata = {
  title: "Sign in · ClinicDesk",
  description:
    "ClinicDesk — clinic management software for dentists, dermatologists, physicians, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="flex min-h-full flex-col"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <AppContextProvider>{children}</AppContextProvider>
      </body>
    </html>
  );
}
