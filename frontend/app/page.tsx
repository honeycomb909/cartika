import { ProductGrid } from '@/components/ProductGrid';
import { Hero } from '@/components/Hero';
import { categoriesApi, productsApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const response = await productsApi.getAll({ page: 1, limit: 12 });
    return response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await categoriesApi.getAll();
    return response.data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main>
        <Hero categories={categories} />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Featured Products
          </h2>
          <ProductGrid products={products} />
        </section>
      </main>
    </div>
  );
}

