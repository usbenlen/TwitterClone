/** @format */

import { NavLink } from "react-router";
import { useParams, useNavigate  } from "react-router";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeftIcon } from "@/shared/icons/index";
import type{ User } from "@/types/user"

interface FollowNavigationProps {
  user: User;
}

export default function FollowNavigation({user} : FollowNavigationProps) {
  const { username } = useParams();
  // const { user } = useProfile(username);
  const navigate = useNavigate();
  
  if (!user) return null;

  return (
    <div className="text-muted-foreground В">

    <div>
        <div className="flex gap-3 justify-left direction-row p-3">
          <button className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted cursor-pointer" onClick={() => navigate(`/${username}`)}>
              <ArrowLeftIcon className="size-5" />
          </button>
          <div>
              <p className="text-xl font-bold text-foreground">{user.displayName}</p>
              <p className="text-md font-medium text-muted-foreground">@{username}</p>
          </div>
        </div>

      <div className="flex justify-around border-b">
        <NavLink
            to={`/${username}/following`}
            className={({ isActive }) =>
                `
                hover:bg-muted
                p-4
                font-medium
                duration-200
                ease-in-out 
                hover:text-foreground
                ${isActive ? "border-b-2 font-semibold text-foreground" : ""}
                `
            }
            >
                Підписки
            </NavLink>

          <NavLink
            to={`/${username}/followers`}
            className={({ isActive }) =>
                `
                hover:bg-muted
                p-4
                font-medium
                duration-200
                ease-in-out 
                hover:text-foreground
                ${isActive ? "border-b-2 font-semibold text-foreground" : ""}
                `
            }
            >
                Читачі
            </NavLink>
        </div>
      </div>
    </div>

  );
}