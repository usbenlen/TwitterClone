interface MediaGridProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  flush?: boolean;
}

export default function MediaGrid<T extends { id: string }>({
  items,
  renderItem,
  flush = false,
}: MediaGridProps<T>) {
  const frameClassName = flush ? "" : "mt-3 rounded-2xl";

  switch (items.length) {
    case 0:
      return null;

    case 1:
      return (
        <div className={`${frameClassName} aspect-16/10 overflow-hidden`}>
          {renderItem(items[0], 0)}
        </div>
      );

    case 2:
      return (
        <div className={`${frameClassName} grid aspect-16/10 grid-cols-2 gap-0.5 overflow-hidden`}>
          {items.map((item, index) => (
            <div key={item.id}>{renderItem(item, index)}</div>
          ))}
        </div>
      );

    case 3:
      return (
        <div className={`${frameClassName} grid aspect-16/10 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden`}>
          <div className="row-span-2">{renderItem(items[0], 0)}</div>
          <div>{renderItem(items[1], 1)}</div>
          <div>{renderItem(items[2], 2)}</div>
        </div>
      );

    default:
      return (
        <div className={`${frameClassName} grid aspect-16/10 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden`}>
          {items.slice(0, 4).map((item, index) => (
            <div key={item.id}>{renderItem(item, index)}</div>
          ))}
        </div>
      );
  }
}
