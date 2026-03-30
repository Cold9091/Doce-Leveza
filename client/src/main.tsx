// Polyfill URL.parse for browsers that don't support it yet (Chrome < 120, Firefox < 126, Safari < 18)
if (typeof URL.parse === "undefined") {
  (URL as any).parse = function (url: string, base?: string): URL | null {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  };
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
