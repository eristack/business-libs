import { permanentRedirect } from "next/navigation";

/** @deprecated Use /sponsor */
export default function DeprecatedSupportUsPage() {
  permanentRedirect("/sponsor");
}
