import type { AnalyticsDashboardData } from "@/lib/analytics-action";
import {
  generateAnalyticsReportHTML,
  type AnalyticsReportMeta,
} from "./generateAnalyticsReportHTML";

export const printAnalyticsReport = (
  data: AnalyticsDashboardData,
  meta: AnalyticsReportMeta
): void => {
  if (typeof document === "undefined") return;

  const reportHTML = generateAnalyticsReportHTML(data, meta);

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
  };

  document.body.appendChild(iframe);
  iframe.srcdoc = reportHTML;
};
