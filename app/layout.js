import "./globals.css";

export const metadata = {
  title: "YGT Executive Limo | Miami Chauffeur Service",
  description:
    "Luxury chauffeur service for Miami, Fort Lauderdale, airports, cruise ports, corporate travel and special events.",
  metadataBase: new URL("https://ygtexecutivelimo.com"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
