import { AdminNavigationItem } from "@/admin/components/layout/navigation";
import { useNavigation } from "@/admin/hooks/useNavigation";

interface NavigationProps {
  vertical?: boolean;
}

export default function Navigation({
    vertical = false,
}: NavigationProps) {
  const navigation = useNavigation();

  return (
      <nav
          className={
            vertical
                ? "flex flex-col gap-2"
                : "flex items-center gap-2"
          }
      >
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
              <AdminNavigationItem
                  key={item.label}
                  to={item.to}
                  icon={<Icon />}
                  vertical={vertical}
                  end={item.to === "/admin"}
              >
                {item.label}
              </AdminNavigationItem>
          );
        })}
      </nav>
  );
}