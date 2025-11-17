import fs from 'fs/promises';
import path from 'path';
import { Persona } from '@/types';

const DB_PATH = path.join(process.cwd(), 'db.json');

interface Database {
  personas: Persona[];
}

export async function readDatabase(): Promise<Database> {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function writeDatabase(data: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function generateId(items: Array<{ id: number }>): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}
