import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mapDbToApi } from '@/utils/mapper';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/products
 * Fetch all products
 */
export const GET = withAuth(async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json((data ?? []).map(mapDbToApi));
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
});

/**
 * POST /api/products
 * Create a new product
 */
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    
    // In a real scenario, use ProductSchema.parse(body)
    
    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapDbToApi(data), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: error.message },
      { status: 400 }
    );
  }
});
