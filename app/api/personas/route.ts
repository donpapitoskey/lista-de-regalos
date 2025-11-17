import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase, generateId } from '@/lib/db';
import { Persona } from '@/types';

// GET /api/personas - Listar todas las personas
export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json(db.personas);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al leer la base de datos' },
      { status: 500 }
    );
  }
}

// POST /api/personas - Crear nueva persona
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    const nuevaPersona: Persona = {
      id: generateId(db.personas),
      nombre,
      regalos: []
    };

    db.personas.push(nuevaPersona);
    await writeDatabase(db);

    return NextResponse.json(nuevaPersona, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear persona' },
      { status: 500 }
    );
  }
}
