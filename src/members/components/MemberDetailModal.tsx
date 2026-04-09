import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Person } from "../types";

import { useDashboardStore } from "../../dashboard/store/dashboardStore";
import { queryKeys } from "../../lib/queryKeys";
import { Modal, ModalCloseButton, ModalPanel } from "../../ui/common/Modal";
import { getPersonById } from "../server/member";
import MemberDetailContent from "./MemberDetailContent";
import MemberForm from "./MemberForm";

interface MemberDetailModalProps {
  isAdmin: boolean;
  canEdit?: boolean;
}

export default function MemberDetailModal({ isAdmin, canEdit = false }: MemberDetailModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    memberModalId: memberId,
    setMemberModalId,
    showCreateModal,
    setShowCreateModal,
  } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: result,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.persons.detail(memberId ?? ""),
    queryFn: () => getPersonById({ data: { id: memberId ?? "" } }),
    enabled: !!memberId,
  });

  const person = (result as Person) ?? null;
  const privateData = isAdmin && result?.privateDetails ? result.privateDetails : null;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t("member.systemError")
    : !result && !loading && memberId
      ? t("member.loadError")
      : null;

  const closeModal = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    if (isCreating) {
      setIsCreating(false);
      setShowCreateModal(false);
      return;
    }
    setMemberModalId(null);
  };

  useEffect(() => {
    if (memberId) {
      setIsOpen(true);
      setIsCreating(false);
    } else if (showCreateModal) {
      setIsOpen(true);
      setIsCreating(true);
      setIsEditing(false);
    } else {
      setIsOpen(false);
      const timeoutId = setTimeout(() => {
        setIsEditing(false);
        setIsCreating(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [memberId, showCreateModal]);

  const refetchPerson = (personId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(personId) });
  };

  const handleBackdropClose = (): void => {
    setMemberModalId(null);
    setShowCreateModal(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={!isEditing && !isCreating ? handleBackdropClose : undefined}>
      <ModalPanel maxWidth="4xl">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 sm:top-5 sm:right-5">
          {canEdit && person && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-full border border-amber-200/50 bg-amber-100/80 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm backdrop-blur-md transition-colors hover:bg-amber-200"
            >
              <Pencil className="size-4" />
              <span className="hidden sm:inline">{t("common.edit")}</span>
            </button>
          )}
          {isAdmin && person && !isEditing && (
            <Link
              to="/dashboard/members/$id"
              params={{ id: person.id }}
              className="flex items-center gap-1.5 rounded-full border border-stone-200/50 bg-stone-100/80 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm backdrop-blur-md transition-colors hover:bg-stone-200"
            >
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">{t("member.viewDetail")}</span>
            </Link>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 rounded-full border border-stone-200/50 bg-stone-100/80 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm backdrop-blur-md transition-colors hover:bg-stone-200"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">{t("common.back")}</span>
            </button>
          )}
          <ModalCloseButton
            onClick={
              isEditing
                ? () => setIsEditing(false)
                : isCreating
                  ? () => {
                      setIsCreating(false);
                      setShowCreateModal(false);
                    }
                  : () => setMemberModalId(null)
            }
            label={t("common.close")}
          />
        </div>

        {isCreating ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <h2 className="text-heading-section mb-6">{t("member.addMember")}</h2>
            <MemberForm
              isAdmin={isAdmin}
              onSuccess={(personId) => {
                setIsCreating(false);
                setShowCreateModal(false);
                setMemberModalId(personId);
              }}
              onCancel={() => {
                setIsCreating(false);
                setShowCreateModal(false);
              }}
            />
          </div>
        ) : loading ? (
          <div className="flex min-h-100 flex-1 flex-col items-center justify-center gap-4">
            <div className="size-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            <p className="font-medium text-stone-500">{t("common.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex min-h-100 flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner">
              <AlertCircle className="size-8" />
            </div>
            <p className="text-lg font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={closeModal}
              className="mt-2 rounded-full bg-stone-100 px-6 py-2.5 font-semibold text-stone-700 transition-colors hover:bg-stone-200"
            >
              {t("common.close")}
            </button>
          </div>
        ) : person ? (
          <div className="flex-1 overflow-y-auto">
            {isEditing ? (
              <div className="p-4 sm:p-6">
                <MemberForm
                  initialData={{ ...person, ...privateData }}
                  isEditing
                  isAdmin={isAdmin}
                  onSuccess={(personId) => {
                    setIsEditing(false);
                    refetchPerson(personId);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <MemberDetailContent
                person={person}
                privateData={privateData}
                isAdmin={isAdmin}
                canEdit={canEdit}
              />
            )}
          </div>
        ) : null}
      </ModalPanel>
    </Modal>
  );
}
