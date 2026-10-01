import { Button } from "@/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { USER_ACTION_ICONS, USER_ACTION_LABELS } from "@/admin/constants";
import type { AdminUser, UserAction } from "@/admin/types";

export function UserActions({
  user,
  busy,
  onAction,
}: {
  user: AdminUser;
  busy: boolean;
  onAction: (action: UserAction) => void;
}) {
  const { user: viewer } = useAuth();
  const ownAccount = user.id === viewer?.id;
  return (
    <div className="flex flex-wrap gap-2">
      {([user.isBlocked ? "unblock" : "block", "delete"] as UserAction[]).map(
        (action) => {
          const Icon = USER_ACTION_ICONS[action];
          return (
            <Button
              key={action}
              size="comfortable"
              shape="rounded"
              variant={action === "delete" ? "destructive" : "outline"}
              disabled={busy || ownAccount}
              title={
                ownAccount
                  ? "Керуйте власним акаунтом у налаштуваннях"
                  : undefined
              }
              onClick={() => onAction(action)}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              {USER_ACTION_LABELS[action]}
            </Button>
          );
        },
      )}
    </div>
  );
}
