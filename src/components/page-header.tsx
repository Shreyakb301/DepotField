export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 border-b border-rule pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
