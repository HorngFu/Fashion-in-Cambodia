import { getCategories } from "@/lib/content";

// Phase 1 placeholder. The real home page is built in Phases 2 and 4.
export default async function HomePage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-3xl font-bold">Fashion in Cambodia</h1>
      <p className="text-lg">
        ស្វែងរកផលិតផលម៉ូដ សម្ភារៈ និងឧបករណ៍ —
        និងហាងដែលលក់វានៅទូទាំងប្រទេសកម្ពុជា។
      </p>
      <p>
        Find fashion products, materials and tools in Cambodia — and the shops
        that sell them. Coming soon.
      </p>

      <section>
        <h2 className="mb-2 font-semibold">Categories</h2>
        <ul className="list-inside list-disc">
          {categories.map((category) => (
            <li key={category.slug}>
              {category.name_en}
              {category.name_km ? ` — ${category.name_km}` : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm opacity-70">
        <a
          className="underline"
          href="https://github.com/HorngFu/Fashion-in-Cambodia"
        >
          Open source on GitHub
        </a>
      </p>
    </main>
  );
}
