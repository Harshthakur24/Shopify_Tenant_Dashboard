import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
   
    const token = request.cookies.get('auth')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get tenant credentials from database
    const tenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId },
      select: {
        shopDomain: true,
        accessToken: true,
        name: true
      }
    });

    if (!tenant || !tenant.accessToken) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured for this tenant' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const limit = searchParams.get('limit') || '50';
    const page = searchParams.get('page') || '1';

    const shop = tenant.shopDomain;
    const accessToken = tenant.accessToken;


    let url: string;
    
    if (customerId) {
      // Fetch specific customer
      url = `https://${shop}/admin/api/2024-10/customers/${customerId}.json`;
    } else {
      // Fetch customers list with pagination - Shopify uses different pagination
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      const sinceId = pageNum > 1 ? (pageNum - 1) * limitNum : undefined;
      
      let queryParams = `limit=${limitNum}`;
      if (sinceId) {
        queryParams += `&since_id=${sinceId}`;
      }
      
      url = `https://${shop}/admin/api/2024-10/customers.json?${queryParams}`;
    }

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorBody: errorText
      });
      throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: customerId ? data.customer : data.customers,
      pagination: customerId ? null : {
        page: parseInt(page),
        limit: parseInt(limit),
        total: data.customers?.length || 0
      },
      tenant: {
        name: tenant.name,
        shopDomain: tenant.shopDomain
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch customers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
