import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import RightSidebarCard from "@/components/layout/desktop/rightSidebar/RightSidebarCard";
import { AdvancedSearchModal } from "@/components/search";
import { useAuth } from "@/hooks";
import { APP_ROUTES } from "@/constants/routes";
import { parseSearchCriteria } from "@/utils/search";

import type { SearchCriteria, SearchLocation, SearchPeople } from "@/types";

interface FilterOptionProps<T extends string> {
  checked: boolean;
  disabled?: boolean;
  label: string;
  value: T;
  onChange: (value: T) => void;
}

function FilterOption<T extends string>({
  checked,
  disabled,
  label,
  value,
  onChange,
}: FilterOptionProps<T>) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(value)}
      className="group flex w-full cursor-pointer items-center justify-between text-sm text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>{label}</span>
      {checked ? (
        <span
          className={`relative flex size-5 items-center justify-center before:absolute before:-inset-2 before:rounded-full before:transition-colors ${
            disabled
              ? ""
              : "group-hover:before:bg-primary/10 group-focus-visible:before:bg-primary/10"
          }`}
        >
          <span className="relative flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        </span>
      ) : (
        <span
          className={`relative flex size-5 items-center justify-center before:absolute before:-inset-2 before:rounded-full before:transition-colors ${
            disabled
              ? ""
              : "group-hover:before:bg-muted group-focus-visible:before:bg-muted"
          }`}
        >
          <Circle className="relative size-5 text-muted-foreground" />
        </span>
      )}
    </button>
  );
}

export default function RightSidebarSearchFilters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const criteria = parseSearchCriteria(searchParams);

  const updateCriteria = (next: SearchCriteria) => {
    navigate(APP_ROUTES.search(next), { replace: true });
  };

  return (
    <>
      <RightSidebarCard title="Search filters">
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-foreground">
              People
            </legend>
            <div role="radiogroup" aria-label="People" className="space-y-2">
              <FilterOption<SearchPeople>
                checked={criteria.people === "anyone"}
                label="From anyone"
                value="anyone"
                onChange={(people) => updateCriteria({ ...criteria, people })}
              />
              <FilterOption<SearchPeople>
                checked={criteria.people === "following"}
                label="People you follow"
                value="following"
                onChange={(people) => updateCriteria({ ...criteria, people })}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-foreground">
              Location
            </legend>
            <div role="radiogroup" aria-label="Location" className="space-y-2">
              <FilterOption<SearchLocation>
                checked={criteria.location === "anywhere"}
                label="Anywhere"
                value="anywhere"
                onChange={(location) =>
                  updateCriteria({ ...criteria, location })
                }
              />
              <FilterOption<SearchLocation>
                checked={criteria.location === "near"}
                disabled={!user?.location}
                label="Near you"
                value="near"
                onChange={(location) =>
                  updateCriteria({ ...criteria, location })
                }
              />
            </div>
            {!user?.location && (
              <p className="mt-2 text-xs text-muted-foreground">
                Add a profile location to search nearby.
              </p>
            )}
          </fieldset>

          <button
            type="button"
            onClick={() => setAdvancedOpen(true)}
            className="cursor-pointer text-sm text-primary transition hover:underline"
          >
            Advanced search
          </button>
        </div>
      </RightSidebarCard>

      {advancedOpen && (
        <AdvancedSearchModal
          criteria={criteria}
          viewerHasLocation={Boolean(user?.location)}
          onApply={(next) => {
            updateCriteria(next);
            setAdvancedOpen(false);
          }}
          onClose={() => setAdvancedOpen(false)}
        />
      )}
    </>
  );
}
