import { RadioOption } from "@/ui/RadioOption";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import RightSidebarCard from "@/components/layout/desktop/rightSidebar/RightSidebarCard";
import { AdvancedSearchModal } from "@/components/search";
import { useAuth } from "@/hooks";
import { APP_ROUTES } from "@/constants/routes";
import { parseSearchCriteria } from "@/utils/search";

import type { SearchCriteria, SearchLocation, SearchPeople } from "@/types";

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
              <RadioOption<SearchPeople>
                className="text-foreground"
                checked={criteria.people === "anyone"}
                label="From anyone"
                value="anyone"
                onChange={(people) => updateCriteria({ ...criteria, people })}
              />
              <RadioOption<SearchPeople>
                className="text-foreground"
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
              <RadioOption<SearchLocation>
                className="text-foreground"
                checked={criteria.location === "anywhere"}
                label="Anywhere"
                value="anywhere"
                onChange={(location) =>
                  updateCriteria({ ...criteria, location })
                }
              />
              <RadioOption<SearchLocation>
                className="text-foreground"
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
