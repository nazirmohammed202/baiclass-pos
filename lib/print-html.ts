/**
 * Print an HTML document via a hidden iframe.
 * Avoids popup blockers (unlike window.open after await).
 */
export const printHtml = (html: string): void => {
  if (typeof document === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  const removeIframe = () => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      removeIframe();
      return;
    }

    frameWindow.addEventListener("afterprint", removeIframe, { once: true });
    window.setTimeout(removeIframe, 60000);

    // Defer so layout/styles settle before the print dialog.
    window.setTimeout(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
      } catch {
        removeIframe();
      }
    }, 250);
  };

  document.body.appendChild(iframe);
  iframe.srcdoc = html;
};
