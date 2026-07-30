/** @format */

import { NavigationItem } from "@/components/layout/desktop/navigation";
import { useNavigation } from "@/hooks/useNavigation";

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
            end={item.label === "Головна"}
          >
            {item.label}
          </NavigationItem>
        );
      })}
    </nav>
  );
}
