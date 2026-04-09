import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { UserProfile } from "../types";

import { UserRole } from "../../auth/types";
import { Button } from "../../ui/common/Button";
import { Card } from "../../ui/common/Card";
import { Modal, ModalCloseButton, ModalPanel } from "../../ui/common/Modal";
import { cn } from "../../ui/utils/cn";
import { useAdminForm } from "../hooks/useAdminForm";
import { changeRole, createUser, deleteUser, toggleStatus } from "../server/user";

interface AdminUserListProps {
  initialUsers: UserProfile[];
  currentUserId: string;
}

interface Notification {
  message: string;
  type: "success" | "error" | "info";
}

export default function AdminUserList({ initialUsers, currentUserId }: AdminUserListProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
  };

  const createUserMutation = useMutation({
    mutationFn: (data: { email: string; password: string; role: UserRole; isActive: boolean }) =>
      createUser({ data }),
    onSuccess: (result) => {
      if (result.user) {
        setUsers((prev) => [...prev, result.user as UserProfile]);
      }
      showNotification(t("admin.createSuccess"), "success");
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: (error: unknown) => {
      showNotification(error instanceof Error ? error.message : t("admin.createError"), "error");
    },
  });

  const roleChangeMutation = useMutation({
    mutationFn: (data: { userId: string; newRole: UserRole }) => changeRole({ data }),
    onSuccess: (_, { userId, newRole }) => {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showNotification(t("admin.roleUpdated"), "success");
    },
    onError: (error: unknown) => {
      showNotification(error instanceof Error ? error.message : t("admin.roleError"), "error");
    },
  });

  const statusChangeMutation = useMutation({
    mutationFn: (data: { userId: string; isActive: boolean }) => toggleStatus({ data }),
    onSuccess: (_, { userId, isActive: newStatus }) => {
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u)));
      showNotification(newStatus ? t("admin.statusApproved") : t("admin.statusLocked"), "success");
    },
    onError: (error: unknown) => {
      showNotification(error instanceof Error ? error.message : t("admin.statusError"), "error");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser({ data: { userId } }),
    onSuccess: (_, userId) => {
      setUsers(users.filter((u) => u.id !== userId));
      showNotification(t("admin.deleteSuccess"), "success");
    },
    onError: (error: unknown) => {
      showNotification(error instanceof Error ? error.message : t("admin.deleteError"), "error");
    },
  });

  const loadingId = roleChangeMutation.isPending
    ? (roleChangeMutation.variables as { userId: string })?.userId
    : statusChangeMutation.isPending
      ? (statusChangeMutation.variables as { userId: string })?.userId
      : deleteUserMutation.isPending
        ? (deleteUserMutation.variables as string)
        : null;

  const form = useAdminForm({
    defaultValues: {
      email: "",
      password: "",
      role: "member" as UserRole,
      isActive: true,
    },
    onSubmit: async ({ value }) => {
      createUserMutation.mutate({
        email: value.email,
        password: value.password,
        role: value.role,
        isActive: value.isActive,
      });
    },
  });

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    roleChangeMutation.mutate({ userId, newRole });
  };

  const handleStatusChange = (userId: string, newStatus: boolean) => {
    statusChangeMutation.mutate({ userId, isActive: newStatus });
  };

  const handleDelete = (userId: string) => {
    if (!confirm(t("admin.deleteConfirm"))) return;
    deleteUserMutation.mutate(userId);
  };

  return (
    <div className="relative space-y-6">
      {notification && (
        <div
          className={cn(
            "fixed top-1/2 left-1/2 z-100 flex max-w-[90vw] min-w-[320px] animate-[fade-in-up_0.3s_ease-out_forwards] items-center gap-3 rounded-xl border px-6 py-3 shadow-lg backdrop-blur-md",
            notification.type === "success" &&
              "border-emerald-200 bg-emerald-50/90 text-emerald-800",
            notification.type === "error" && "border-red-200 bg-red-50/90 text-red-800",
            notification.type === "info" && "border-amber-200 bg-amber-50/90 text-amber-800",
          )}
        >
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          {t("admin.addUser")}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-border-default bg-stone-50/50 tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500">
                  {t("admin.emailHeader")}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500">
                  {t("admin.roleHeader")}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500">
                  {t("admin.statusHeader")}
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500">
                  {t("admin.createdHeader")}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500">
                  {t("admin.actionsHeader")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-stone-50/80">
                  <td className="px-6 py-4 font-medium text-stone-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                        user.role === UserRole.enum.admin &&
                          "border border-amber-200 bg-amber-100 text-amber-800",
                        user.role === UserRole.enum.editor &&
                          "border border-sky-200 bg-sky-100 text-sky-800",
                        user.role === UserRole.enum.member &&
                          "border border-stone-200 bg-stone-100 text-stone-600",
                      )}
                    >
                      {t(`role.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                        user.isActive
                          ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
                          : "border border-red-200 bg-red-100 text-red-800",
                      )}
                    >
                      {user.isActive ? t("admin.active") : t("admin.pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="space-x-3 px-6 py-4 text-right">
                    {user.id !== currentUserId ? (
                      <>
                        {user.isActive ? (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusChange(user.id, false)}
                            className="font-medium text-stone-600 hover:text-stone-900 disabled:opacity-50"
                          >
                            {t("admin.lock")}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusChange(user.id, true)}
                            className="font-medium text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                          >
                            {t("admin.approve")}
                          </button>
                        )}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          disabled={loadingId === user.id}
                          className="rounded-lg border border-stone-200 bg-transparent px-2 py-1 text-sm font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="member">{t("role.member")}</option>
                          <option value="editor">{t("role.editor")}</option>
                          <option value="admin">{t("role.admin")}</option>
                        </select>
                        <button
                          type="button"
                          disabled={loadingId === user.id}
                          onClick={() => handleDelete(user.id)}
                          className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {t("common.delete")}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-stone-400 italic">{t("admin.you")}</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                    {t("admin.noUsers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalPanel maxWidth="md" className="rounded-2xl">
          <div className="flex items-center justify-between border-b border-stone-100/80 bg-stone-50/50 px-6 py-5">
            <h3 className="font-serif text-xl font-bold text-stone-800">
              {t("admin.createTitle")}
            </h3>
            <ModalCloseButton
              onClick={() => setIsCreateModalOpen(false)}
              label={t("common.close")}
              className="size-8"
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="p-6"
          >
            <div className="space-y-4">
              <form.AppField name="email">
                {(field) => (
                  <div>
                    <label htmlFor={field.name} className="text-label">
                      {t("admin.emailRequired")}
                    </label>
                    <input
                      id={field.name}
                      type="email"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 shadow-sm transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none sm:py-2.5"
                      placeholder={t("admin.emailPlaceholder")}
                    />
                  </div>
                )}
              </form.AppField>

              <form.AppField name="password">
                {(field) => (
                  <div>
                    <label htmlFor={field.name} className="text-label">
                      {t("admin.passwordRequired")}
                    </label>
                    <input
                      id={field.name}
                      type="password"
                      required
                      minLength={8}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 shadow-sm transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none sm:py-2.5"
                      placeholder={t("admin.passwordHint")}
                    />
                  </div>
                )}
              </form.AppField>

              <form.AppField name="role">
                {(field) => (
                  <div>
                    <label htmlFor={field.name} className="text-label">
                      {t("common.role")}
                    </label>
                    <select
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as UserRole)}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none sm:py-2.5"
                    >
                      <option value="member">{t("admin.roleMember")}</option>
                      <option value="editor">{t("admin.roleEditor")}</option>
                      <option value="admin">{t("admin.roleAdmin")}</option>
                    </select>
                  </div>
                )}
              </form.AppField>

              <form.AppField name="isActive">
                {(field) => (
                  <div>
                    <label htmlFor={field.name} className="text-label">
                      {t("common.status")}
                    </label>
                    <select
                      id={field.name}
                      value={field.state.value ? "true" : "false"}
                      onChange={(e) => field.handleChange(e.target.value === "true")}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none sm:py-2.5"
                    >
                      <option value="true">{t("admin.statusActive")}</option>
                      <option value="false">{t("admin.statusPending")}</option>
                    </select>
                  </div>
                )}
              </form.AppField>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={form.state.isSubmitting}>
                {form.state.isSubmitting ? t("admin.creating") : t("admin.createUser")}
              </Button>
            </div>
          </form>
        </ModalPanel>
      </Modal>
    </div>
  );
}
