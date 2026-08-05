/** @format */

interface MediaGridProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

export default function MediaGrid<T extends { id: string }>({
  items,
  renderItem,
}: MediaGridProps<T>) {
  switch (items.length) {
    case 0:
      return null;

    case 1:
      return (
        <div className="aspect-16/10 overflow-hidden rounded-2xl">
          {renderItem(items[0])}
        </div>
      );

    case 2:
      return (
        <div className="grid aspect-16/10 grid-cols-2 gap-0.5 overflow-hidden rounded-2xl">
          {items.map((item) => (
            <div key={item.id}>{renderItem(item)}</div>
          ))}
        </div>
      );

    case 3:
      return (
        <div className="grid aspect-16/10 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl">
          <div className="row-span-2">{renderItem(items[0])}</div>

          <div>{renderItem(items[1])}</div>

          <div>{renderItem(items[2])}</div>
        </div>
      );

    default:
      return (
        <div className="grid aspect-16/10 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl">
          {items.slice(0, 4).map((item) => (
            <div key={item.id}>{renderItem(item)}</div>
          ))}
        </div>
      );
  }
}
