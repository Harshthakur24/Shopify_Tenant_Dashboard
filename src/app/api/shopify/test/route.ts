import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get authentication token from cookies
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

    // Test with a simple shop info request
    const shopInfoUrl = `https://${tenant.shopDomain}/admin/api/2024-10/shop.json`;
    
    const response = await fetch(shopInfoUrl, {
      headers: {
        'X-Shopify-Access-Token': tenant.accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Shopify API error: ${response.status} ${response.statusText}`,
        details: errorText,
        url: shopInfoUrl,
        tenant: {
          name: tenant.name,
          shopDomain: tenant.shopDomain,
          hasAccessToken: !!tenant.accessToken
        }
      });
    }

    const shopData = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Shopify connection successful',
      shop: shopData.shop,
      tenant: {
        name: tenant.name,
        shopDomain: tenant.shopDomain
      }
    });

  } catch (error) {
    console.error('Error testing Shopify connection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test Shopify connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
