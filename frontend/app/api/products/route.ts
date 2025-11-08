import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    if (!supabase) {
      console.error('Supabase not configured');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    let query = supabase
      .from('products')
      .select(`
        *,
        sellers (name),
        categories (name, slug)
      `)
      .eq('is_approved', true)
      .eq('is_active', true);

    // Apply filters
    if (category) {
      query = query.eq('categories.slug', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%`);
    }

    // Apply sorting
    if (['created_at', 'price', 'name', 'views_count'].includes(sort)) {
      query = query.order(sort, { ascending: order === 'asc' });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const result: any = await query;
    const products = result.data as any[] || [];
    const error = result.error;
    const count = result.count;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      products: products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: parseFloat(product.price),
        compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        stock_quantity: product.stock_quantity,
        images: product.images || [],
        category: product.categories?.name,
        seller_name: product.sellers?.name,
        views_count: product.views_count,
        created_at: product.created_at
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}