import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase, generateId } from '@/lib/db';
import { Regalo } from '@/types';

// POST /api/personas/[personaId]/regalos - Crear nuevo regalo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string }> }
) {
  try {
    const { personaId } = await params;
    const body = await request.json();
    const { nombre, url, url_imagen, lugarCompra } = body;

    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json(
        { error: 'El nombre del regalo es requerido' },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    const persona = db.personas.find(p => p.id === parseInt(personaId));

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    const nuevoRegalo: Regalo = {
      id: generateId(persona.regalos),
      nombre,
      url: url || undefined,
      url_imagen: url_imagen || undefined,
      lugarCompra: lugarCompra || undefined,
      tomado: false
    };

    persona.regalos.push(nuevoRegalo);
    await writeDatabase(db);

    return NextResponse.json(nuevoRegalo, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error al crear regalo' },
      { status: 500 }
    );
  }
}
