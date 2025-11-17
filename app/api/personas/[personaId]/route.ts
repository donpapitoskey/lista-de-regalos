import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/db';

// GET /api/personas/[personaId] - Obtener persona por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string }> }
) {
  try {
    const { personaId } = await params;
    const db = await readDatabase();
    const persona = db.personas.find(p => p.id === parseInt(personaId));

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(persona);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener persona' },
      { status: 500 }
    );
  }
}

// PUT /api/personas/[personaId] - Actualizar persona
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string }> }
) {
  try {
    const { personaId } = await params;
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    const personaIndex = db.personas.findIndex(p => p.id === parseInt(personaId));

    if (personaIndex === -1) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    db.personas[personaIndex].nombre = nombre;
    await writeDatabase(db);

    return NextResponse.json(db.personas[personaIndex]);
  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar persona' },
      { status: 500 }
    );
  }
}

// DELETE /api/personas/[personaId] - Eliminar persona
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ personaId: string }> }
) {
  try {
    const { personaId } = await params;
    const db = await readDatabase();
    const personaIndex = db.personas.findIndex(p => p.id === parseInt(personaId));

    if (personaIndex === -1) {
      return NextResponse.json(
        { error: 'Persona no encontrada' },
        { status: 404 }
      );
    }

    const personaEliminada = db.personas.splice(personaIndex, 1)[0];
    await writeDatabase(db);

    return NextResponse.json(personaEliminada);
  } catch {
    return NextResponse.json(
      { error: 'Error al eliminar persona' },
      { status: 500 }
    );
  }
}
