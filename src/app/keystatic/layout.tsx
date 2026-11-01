import KeystaticApp from "./keystatic";

// The admin UI is its own root layout, separate from the public site.
export default function KeystaticLayout() {
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
