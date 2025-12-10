import { useEffect, useCallback, useRef } from "react";

interface ContentProtectionOptions {
  enabled?: boolean;
  showWarning?: boolean;
  warningMessage?: string;
  userIdentifier?: string;
}

let styleRefCount = 0;

export function useContentProtection(options: ContentProtectionOptions = {}) {
  const {
    enabled = true,
    showWarning = true,
    warningMessage = "Este conteúdo é protegido e não pode ser copiado ou gravado.",
    userIdentifier = "",
  } = options;

  const preventContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    if (showWarning) {
      console.warn(warningMessage);
    }
    return false;
  }, [showWarning, warningMessage]);

  const preventKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const hasModifier = e.ctrlKey || e.metaKey;
    
    const blockedWithModifier = ["p", "s", "c", "u", "a"];
    const blockedWithModifierAndShift = ["i", "j", "c"];
    const blockedAlone = ["printscreen", "f12"];
    
    let shouldBlock = false;
    
    if (blockedAlone.includes(key)) {
      shouldBlock = true;
    }
    
    if (hasModifier && blockedWithModifier.includes(key)) {
      shouldBlock = true;
    }
    
    if (hasModifier && e.shiftKey && blockedWithModifierAndShift.includes(key)) {
      shouldBlock = true;
    }
    
    if (e.key === "PrintScreen") {
      shouldBlock = true;
    }

    if (shouldBlock) {
      e.preventDefault();
      e.stopPropagation();
      if (showWarning) {
        console.warn(warningMessage);
      }
      return false;
    }
  }, [showWarning, warningMessage]);

  const preventDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    return false;
  }, []);

  const preventCopy = useCallback((e: ClipboardEvent) => {
    e.preventDefault();
    if (showWarning) {
      console.warn(warningMessage);
    }
    return false;
  }, [showWarning, warningMessage]);

  const preventSelection = useCallback((e: Event) => {
    e.preventDefault();
    return false;
  }, []);

  const preventPrint = useCallback((e: Event) => {
    e.preventDefault();
    if (showWarning) {
      console.warn(warningMessage);
    }
    return false;
  }, [showWarning, warningMessage]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventKeyboardShortcuts, true);
    document.addEventListener("dragstart", preventDrag);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("selectstart", preventSelection);
    window.addEventListener("beforeprint", preventPrint);

    let styleElement = document.getElementById("content-protection-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "content-protection-styles";
      styleElement.textContent = `
        .protected-content {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          pointer-events: auto;
        }
        .protected-content img,
        .protected-content video,
        .protected-content canvas,
        .protected-content iframe {
          pointer-events: none;
          -webkit-user-drag: none;
          user-drag: none;
        }
        @media print {
          .protected-content {
            display: none !important;
            visibility: hidden !important;
          }
          body * {
            display: none !important;
            visibility: hidden !important;
          }
          body::before {
            content: "Este conteúdo é protegido e não pode ser impresso.";
            display: block !important;
            visibility: visible !important;
            font-size: 24px;
            text-align: center;
            padding: 100px;
            color: #000;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
    styleRefCount++;

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventKeyboardShortcuts, true);
      document.removeEventListener("dragstart", preventDrag);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("selectstart", preventSelection);
      window.removeEventListener("beforeprint", preventPrint);
      
      styleRefCount--;
      if (styleRefCount <= 0) {
        const existingStyle = document.getElementById("content-protection-styles");
        if (existingStyle) {
          existingStyle.remove();
        }
        styleRefCount = 0;
      }
    };
  }, [enabled, preventContextMenu, preventKeyboardShortcuts, preventDrag, preventCopy, preventSelection, preventPrint]);

  return { userIdentifier };
}

interface ProtectionOverlayProps {
  userIdentifier?: string;
  showWatermark?: boolean;
}

export function ProtectionOverlay({ userIdentifier, showWatermark = true }: ProtectionOverlayProps) {
  if (!showWatermark || !userIdentifier) return null;

  const timestamp = new Date().toLocaleString("pt-BR");

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-50 overflow-hidden select-none"
      style={{ 
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 100px,
            rgba(255,255,255,0.02) 100px,
            rgba(255,255,255,0.02) 200px
          )`,
        }}
      />
      <div className="absolute top-4 right-4 text-white/10 text-xs font-mono">
        {userIdentifier}
      </div>
      <div className="absolute bottom-4 left-4 text-white/10 text-xs font-mono">
        {timestamp}
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: 0.03,
        }}
      >
        <div 
          className="text-white text-2xl font-bold transform -rotate-45 whitespace-nowrap"
          style={{
            textShadow: "none",
          }}
        >
          {userIdentifier} - {timestamp}
        </div>
      </div>
    </div>
  );
}

export function ScreenCaptureBlocker({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          console.clear();
          console.log("%cAtenção!", "color: red; font-size: 40px; font-weight: bold;");
          console.log("%cEste conteúdo é protegido por direitos autorais.", "font-size: 16px;");
        }
      } else {
        devtoolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 1000);
    window.addEventListener("resize", checkDevTools);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Content viewing paused - window not visible");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkDevTools);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return null;
}
