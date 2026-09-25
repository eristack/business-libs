type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="max-w-2xl">
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
        {description}
      </p>
    </header>
  );
}
