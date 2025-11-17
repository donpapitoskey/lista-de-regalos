import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL es requerida' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Fetch HTML de la URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GiftListBot/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'No se pudo acceder a la URL' },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraer metadatos Open Graph
    const ogImage = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    $('meta[property="og:image:url"]').attr('content');

    const title = $('meta[property="og:title"]').attr('content') ||
                  $('meta[name="twitter:title"]').attr('content') ||
                  $('title').text();

    return NextResponse.json({
      url_imagen: ogImage || null,
      title: title || null,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error al extraer metadatos' },
      { status: 500 }
    );
  }
}
