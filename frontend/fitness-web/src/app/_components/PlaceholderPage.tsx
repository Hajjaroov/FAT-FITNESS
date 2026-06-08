type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-zinc-950">
      <section className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Placeholder page</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          This page is only a temporary placeholder and will be worked on in a
          later milestone.
        </p>
      </section>
    </main>
  );
}
