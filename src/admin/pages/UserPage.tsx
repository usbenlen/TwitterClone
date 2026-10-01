import { Link, useNavigate, useParams } from "react-router";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useAdminUserQuery, useAdminUserActionMutation } from "@/admin/store";
import { USER_ACTION_LABELS } from "@/admin/constants";
import { useActionConfirmation } from "@/admin/components/ActionConfirmation";
import { UserSummary } from "@/admin/components/Summaries";
import { QueryState } from "@/admin/components/ListControls";
import { APP_ROUTES } from "@/constants/routes";
import { UserActions } from "@/admin/components/UserActions";
import { formatCount, formatDateTime } from "@/utils/format";
import type { UserAction } from "@/admin/types";

export default function UserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const query = useAdminUserQuery(userId ?? skipToken);
  const [mutate] = useAdminUserActionMutation();
  const confirmation = useActionConfirmation();
  const user = query.currentData;

  const act = (action: UserAction) => {
    if (!user) return;
    confirmation.ask({
      label: USER_ACTION_LABELS[action],
      tasks: [
        { id: user.id, run: () => mutate({ id: user.id, action }).unwrap() },
      ],
      onDone: (failed) => {
        if (!failed.length && action === "delete")
          navigate(APP_ROUTES.ADMIN_USERS, { replace: true });
      },
    });
  };

  return (
    <>
      <Link
        to={APP_ROUTES.ADMIN_USERS}
        className="text-sm text-primary hover:underline"
      >
        ← До користувачів
      </Link>
      <h1 className="text-2xl font-bold">Акаунт користувача</h1>
      <QueryState
        loading={query.isFetching && !user}
        error={query.error}
        retry={query.refetch}
        empty={!user}
      >
        {user && (
          <section className="space-y-5 overflow-hidden rounded-2xl border border-border p-5">
            <UserSummary user={user} />
            <p className="whitespace-pre-wrap">
              {user.bio || "Опис відсутній."}
            </p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{user.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Приєднався</dt>
                <dd>{formatDateTime(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Читачі / читає</dt>
                <dd>
                  {formatCount(user.followersCount)} /{" "}
                  {formatCount(user.followingCount)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Дописи</dt>
                <dd>{formatCount(user.postsCount)}</dd>
              </div>
            </dl>
            <Link
              to={APP_ROUTES.profile(user.username)}
              className="block text-primary hover:underline"
            >
              Відкрити профіль
            </Link>
            <UserActions
              user={user}
              busy={confirmation.busy || query.isFetching}
              onAction={act}
            />
          </section>
        )}
      </QueryState>
      {confirmation.modal}
    </>
  );
}
