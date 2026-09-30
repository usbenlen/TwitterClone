import { APP_ROUTES } from "@/constants/routes";
import { useNavigation } from "@/hooks/useNavigation";

import { NavigationItem } from "@/components/layout/desktop/navigation";

interface NavigationProps {
  vertical?: boolean;
}

export default function Navigation({ vertical = false }: NavigationProps) {
  const navigation = useNavigation();

  return (
    <nav
      className={vertical ? "flex flex-col gap-2" : "flex items-center gap-2"}
    >
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavigationItem
            key={item.label}
            to={item.to}
            icon={<Icon />}
            vertical={vertical}
            end={item.to === APP_ROUTES.HOME}
          >
            {item.label}
          </NavigationItem>
        );
      })}
    </nav>
  );
}
