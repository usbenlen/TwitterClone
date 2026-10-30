import { RadioOption } from "@/components/ui/RadioOption";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import RightSidebarCard from "@/components/navigation/desktop/RightSidebarCard";
import { sidebarCardActionClassName } from "@/components/navigation/desktop/RightSidebarCard";
import AdvancedSearchModal from "@/components/search/AdvancedSearchModal";

import { useAuth } from "@/hooks/auth/useAuth";

import { APP_ROUTES } from "@/constants/routes";

import { parseSearchCriteria } from "@/utils/searchCriteria";

import type {
  SearchCriteria,
  SearchLocation,
  SearchPeople,
} from "@/types/search";

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
      <RightSidebarCard
        title="Search filters"
        footer={
          <button
            type="button"
            onClick={() => setAdvancedOpen(true)}
            className={sidebarCardActionClassName}
          >
            Advanced search
          </button>
        }
      >
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
