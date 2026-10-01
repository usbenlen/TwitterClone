import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { REPORT_REASONS } from "@/constants/report";
import { useCreateReportMutation } from "@/store/reportsApi";
import { errorMessage } from "@/store/api";
import type { CreateReportRequest, ReportReason } from "@/types/report";

interface Props {
  targetType: CreateReportRequest["targetType"];
  targetId: string;
  onClose: () => void;
}
// Mounted only while open so every target starts with fresh form and mutation state.
export default function ReportModal({ targetType, targetId, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [createReport, result] = useCreateReportMutation();

  const submit = async () => {
    if (!reason || result.isLoading) return;
    try {
      await createReport({ targetType, targetId, reason }).unwrap();
    } catch {
      /* Retain the form for retry. */
    }
  };

  return (
    <Modal open title="Поскаржитися" busy={result.isLoading} onClose={onClose}>
      {result.isSuccess ? (
        <div role="status" className="space-y-4">
          <CheckCircle2 className="size-8 text-primary" />
          <p>Скаргу надіслано. Адміністратор перевірить її.</p>
          <Button onClick={onClose}>Готово</Button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Оберіть причину скарги.
          </p>
          <fieldset disabled={result.isLoading} className="space-y-2">
            <legend className="sr-only">Причина скарги</legend>
            {(Object.entries(REPORT_REASONS) as [ReportReason, string][]).map(
              ([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="accent-primary"
                  />
                  {label}
                </label>
              ),
            )}
          </fieldset>
          {result.error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {errorMessage(result.error)}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={result.isLoading}
              onClick={onClose}
            >
              Скасувати
            </Button>
            <Button
              disabled={!reason}
              isLoading={result.isLoading}
              onClick={() => void submit()}
            >
              Надіслати
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
