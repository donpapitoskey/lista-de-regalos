import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/db';

// GET /api/personas/[personaId]/regalos/[regaloId] - Obtener regalo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string; regaloId: string }> }
) {
  try {
    const { personaId, regaloId } = await params;
    const db = await readDatabase();
    const persona = db.personas.find(p => p.id === parseInt(personaId));

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    const regalo = persona.regalos.find(r => r.id === parseInt(regaloId));

    if (!regalo) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(regalo);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener regalo' },
      { status: 500 }
    );
  }
}

// PUT /api/personas/[personaId]/regalos/[regaloId] - Actualizar regalo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string; regaloId: string }> }
) {
  try {
    const { personaId, regaloId } = await params;
    const body = await request.json();
    const { nombre, url, url_imagen, lugarCompra, tomado } = body;

    const db = await readDatabase();
    const persona = db.personas.find(p => p.id === parseInt(personaId));

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    const regaloIndex = persona.regalos.findIndex(r => r.id === parseInt(regaloId));

    if (regaloIndex === -1) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar solo los campos proporcionados
    if (nombre !== undefined) persona.regalos[regaloIndex].nombre = nombre;
    if (url !== undefined) persona.regalos[regaloIndex].url = url || undefined;
    if (url_imagen !== undefined) persona.regalos[regaloIndex].url_imagen = url_imagen || undefined;
    if (lugarCompra !== undefined) persona.regalos[regaloIndex].lugarCompra = lugarCompra || undefined;
    if (tomado !== undefined) persona.regalos[regaloIndex].tomado = tomado;

    await writeDatabase(db);

    return NextResponse.json(persona.regalos[regaloIndex]);
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar regalo' },
      { status: 500 }
    );
  }
}

// DELETE /api/personas/[personaId]/regalos/[regaloId] - Eliminar regalo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string; regaloId: string }> }
) {
  try {
    const { personaId, regaloId } = await params;
    const db = await readDatabase();
    const persona = db.personas.find(p => p.id === parseInt(personaId));

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    const regaloIndex = persona.regalos.findIndex(r => r.id === parseInt(regaloId));

    if (regaloIndex === -1) {
      return NextResponse.json(
        { error: 'Regalo no encontrado' },
        { status: 404 }
      );
    }

    const regaloEliminado = persona.regalos.splice(regaloIndex, 1)[0];
    await writeDatabase(db);

    return NextResponse.json(regaloEliminado);
  } catch {
    return NextResponse.json(
      { error: 'Error al eliminar regalo' },
      { status: 500 }
    );
  }
}
