import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { useAuth } from "@/hooks/auth/useAuth";

import { AppleIcon, GithubIcon, Button } from "@/components/ui";

export function AccountConnections() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { googleLinkedUserId?: string } | null;
  const [linked] = useState(() => Boolean(user && state?.googleLinkedUserId === user.id));
  useEffect(() => {
    if (!state?.googleLinkedUserId) return;
    const nextState = { ...state };
    delete nextState.googleLinkedUserId;
    navigate({ pathname: location.pathname, search: location.search, hash: location.hash }, { replace: true, state: nextState });
  }, [location.hash, location.pathname, location.search, navigate, state]);
  return (
    <section className="border-t border-border p-5">
      <h2 className="font-semibold">Прив’язати</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        Прив’яжіть акаунт одного з доступних сервісів, щоб входити до застосунку
        без пароля.
      </p>
      <GoogleAuthButton mode="link" shape="rounded" linked={linked}>
        {[
          { name: "Apple", Icon: AppleIcon },
          { name: "GitHub", Icon: GithubIcon },
        ].map(({ name, Icon }) => (
          <span
            key={name}
            title="Незабаром"
            className="inline-flex cursor-default"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              shape="rounded"
              disabled
              aria-label={`${name} - незабаром`}
            >
              <Icon className="size-5" />
            </Button>
          </span>
        ))}
      </GoogleAuthButton>
    </section>
  );
}
