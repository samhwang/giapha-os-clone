import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { authClient } from "../../auth/client";
import { logger } from "../../lib/logger";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      void navigate({ to: "/login" });
    } catch (err) {
      logger.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {isLoggingOut ? t("auth.loggingOut") : t("auth.logout")}
    </button>
  );
}
