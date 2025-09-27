export default async function GamePage({ params }) {
  const { id } = await params || {};

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Games{ id ? ` — ${id}` : '' }</h1>
    </div>
  );
}
