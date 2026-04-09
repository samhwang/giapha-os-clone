import type { ReactNode } from "react";

import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "../../ui/common/Button";
import { useDashboardStore } from "../store/dashboardStore";

export default function AvatarToggle(): ReactNode {
  const { showAvatar, setShowAvatar } = useDashboardStore();
  const { t } = useTranslation();

  return (
    <Button onClick={() => setShowAvatar(!showAvatar)}>
      {showAvatar ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
      <span className="inline-block min-w-max tracking-wide">
        {showAvatar ? t("nav.hideAvatar") : t("nav.showAvatar")}
      </span>
    </Button>
  );
}
