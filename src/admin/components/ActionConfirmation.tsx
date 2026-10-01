import { useState } from "react";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { errorMessage } from "@/store/api";
import { useAppStore } from "@/store/hooks";
import { sessionGeneration } from "@/store/session";

export interface ActionTask {
  id: string;
  run: () => Promise<unknown>;
}

interface Action {
  label: string;
  tasks: ActionTask[];
  onDone?: (failedIds: string[]) => void;
}

export async function runActionTasks(
  tasks: ActionTask[],
  active: () => boolean = () => true,
) {
  const failed: ActionTask[] = [];
  const errors: string[] = [];

  for (const task of tasks) {
    if (!active()) break;
    try {
      await task.run();
    } catch (cause) {
      failed.push(task);
      errors.push(errorMessage(cause));
    }
  }
  return { failed, errors };
}

export function useActionConfirmation() {
  const store = useAppStore();
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = (next: Action) => {
    setError(null);
    setAction(next);
  };

  const confirm = async () => {
    if (!action || busy) return;

    setBusy(true);
    setError(null);

    const generation = sessionGeneration(store.getState());
    const active = () => generation === sessionGeneration(store.getState());
    const { failed, errors } = await runActionTasks(action.tasks, active);

    setBusy(false);

    if (!active()) {
      setAction(null);
      return;
    }

    action.onDone?.(failed.map((task) => task.id));
    if (failed.length) {
      setAction({ ...action, tasks: failed });
      setError(`${failed.length} дій не виконано. ${errors[0]}`);
    } else setAction(null);
  };

  const modal = (
    <ConfirmModal
      open={Boolean(action)}
      title={`${action?.label ?? "Підтвердити"}?`}
      description={
        action && action.tasks.length > 1
          ? `Вибрано об’єктів: ${action.tasks.length}.`
          : "Підтвердьте адміністративну дію."
      }
      confirmText={action?.label}
      busy={busy}
      error={error}
      onCancel={() => {
        if (!busy) setAction(null);
      }}
      onConfirm={() => void confirm()}
    />
  );

  return { ask, busy, modal };
}
