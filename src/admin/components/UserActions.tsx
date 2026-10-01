import { Button } from "@/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { USER_ACTION_LABELS } from "@/admin/constants";
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
        (action) => (
          <Button
            key={action}
            size="sm"
            variant={action === "delete" ? "destructive" : "outline"}
            disabled={busy || ownAccount}
            title={
              ownAccount
                ? "Керуйте власним акаунтом у налаштуваннях"
                : undefined
            }
            onClick={() => onAction(action)}
          >
            {USER_ACTION_LABELS[action]}
          </Button>
        ),
      )}
    </div>
  );
}
