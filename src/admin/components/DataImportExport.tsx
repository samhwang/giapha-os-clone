import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Download, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../ui/common/Button";
import { Card } from "../../ui/common/Card";
import { Modal, ModalPanel } from "../../ui/common/Modal";
import { cn } from "../../ui/utils/cn";
import { exportData, importData } from "../server/data";
import { exportToCsvZip, parseCsvZip } from "../utils/csv";
import { exportToGedcom, parseGedcom } from "../utils/gedcom";

type ExportFormat = "json" | "gedcom" | "csv";

export default function DataImportExport() {
  const { t } = useTranslation();
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportMutation = useMutation({
    mutationFn: async (format: ExportFormat) => {
      const data = await exportData();
      const dateSuffix = new Date().toISOString().split("T")[0];

      if (format === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        downloadBlob(blob, `giapha-export-${dateSuffix}.json`);
      } else if (format === "gedcom") {
        const gedcomStr = exportToGedcom({
          persons: data.persons,
          relationships: data.relationships,
        });
        const blob = new Blob([gedcomStr], { type: "text/plain" });
        downloadBlob(blob, `giapha-export-${dateSuffix}.ged`);
      } else if (format === "csv") {
        const zipBlob = await exportToCsvZip({
          persons: data.persons,
          relationships: data.relationships,
        });
        downloadBlob(zipBlob, `giapha-export-${dateSuffix}.zip`);
      }
    },
    onError: (error: unknown) => {
      setImportStatus({
        type: "error",
        message: error instanceof Error ? error.message : t("data.downloadError"),
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const name = file.name.toLowerCase();
      let persons: unknown[];
      let relationships: unknown[];

      if (name.endsWith(".ged")) {
        const text = await file.text();
        const parsed = parseGedcom(text);
        persons = parsed.persons;
        relationships = parsed.relationships;
      } else if (name.endsWith(".zip")) {
        const parsed = await parseCsvZip(file);
        persons = parsed.persons;
        relationships = parsed.relationships;
      } else {
        const fileText = await file.text();
        const payload = JSON.parse(fileText);
        if (!payload.persons || !payload.relationships) {
          throw new Error(t("data.invalidStructure"));
        }
        persons = payload.persons;
        relationships = payload.relationships;
      }

      return importData({
        data: {
          persons: persons as Parameters<typeof importData>[0]["data"]["persons"],
          relationships: relationships as Parameters<typeof importData>[0]["data"]["relationships"],
        },
      });
    },
    onSuccess: (result) => {
      setImportStatus({
        type: "success",
        message: t("data.restoreSuccess", {
          persons: result.imported.persons,
          relationships: result.imported.relationships,
        }),
      });
      setShowConfirm(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error: unknown) => {
      setImportStatus({
        type: "error",
        message: error instanceof Error ? error.message : t("data.restoreError"),
      });
      setShowConfirm(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const isExporting = exportMutation.isPending;
  const isImporting = importMutation.isPending;

  const handleExport = () => {
    exportMutation.mutate(exportFormat);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isValid = name.endsWith(".json") || name.endsWith(".ged") || name.endsWith(".zip");
    if (!isValid) {
      setImportStatus({ type: "error", message: t("data.invalidFileType") });
      return;
    }
    setSelectedFile(file);
    setShowConfirm(true);
    setImportStatus(null);
  };

  const handleConfirmImport = () => {
    if (!selectedFile) return;
    importMutation.mutate(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Export Card */}
        <Card variant="elevated" className="group relative overflow-hidden p-6 hover:shadow-md">
          <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-amber-200/20 blur-2xl transition-colors group-hover:bg-amber-300/30" />
          <div className="relative z-10 mb-4 flex items-start gap-4">
            <div className="rounded-xl bg-stone-100 p-3 text-stone-600">
              <Download className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">{t("data.backupTitle")}</h3>
              <p className="mt-1 text-sm text-stone-500">{t("data.backupDesc")}</p>
            </div>
          </div>
          <div className="mb-3 flex gap-2">
            {(["json", "gedcom", "csv"] as const).map((fmt) => (
              <button
                type="button"
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                  exportFormat === fmt
                    ? "border-amber-300 bg-amber-100 text-amber-800"
                    : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100",
                )}
              >
                {fmt === "json" ? "JSON" : fmt === "gedcom" ? "GEDCOM" : "CSV (ZIP)"}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full rounded-xl"
          >
            {isExporting ? t("data.downloading") : t("data.downloadBackup")}
          </Button>
        </Card>

        {/* Import Card */}
        <Card variant="elevated" className="group relative overflow-hidden p-6 hover:shadow-md">
          <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-rose-200/20 blur-2xl transition-colors group-hover:bg-rose-300/30" />
          <div className="relative z-10 mb-4 flex items-start gap-4">
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <Upload className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">{t("data.restoreTitle")}</h3>
              <p className="mt-1 text-sm text-stone-500">
                {t("data.restoreDesc")}
                <span className="ml-1 font-semibold text-rose-600">{t("data.restoreWarning")}</span>
              </p>
            </div>
          </div>
          <p className="mb-3 text-xs text-stone-400">{t("data.supportedFormats")}</p>
          <input
            type="file"
            accept=".json,.ged,.zip"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
          >
            {isImporting ? t("data.restoring") : t("data.selectFile")}
          </Button>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <ModalPanel maxWidth="md" className="rounded-2xl p-6">
          <div className="mb-5 flex items-start gap-4">
            <div className="mt-1 shrink-0 rounded-full bg-rose-100/50 p-3 text-rose-600">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">{t("data.confirmTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {t("data.confirmMessage")}{" "}
                <span className="rounded bg-stone-100 px-1 font-mono text-xs">
                  {selectedFile?.name}
                </span>
                .
              </p>
              <p className="mt-2 text-sm font-semibold text-rose-600">{t("data.confirmWarning")}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isImporting}
            >
              {t("data.confirmCancel")}
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting ? t("data.confirmRestoring") : t("data.confirmProceed")}
            </Button>
          </div>
        </ModalPanel>
      </Modal>

      {/* Status messages */}
      {importStatus && (
        <div
          className={cn(
            "flex animate-[fade-in-up_0.3s_ease-out_forwards] items-center gap-3 rounded-xl border p-4",
            importStatus.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {importStatus.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <AlertTriangle className="size-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{importStatus.message}</p>
        </div>
      )}
    </div>
  );
}
