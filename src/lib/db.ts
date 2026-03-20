import { supabase } from './supabase';
import type { Entry, NewEntry, UpdateEntry, Season } from '../types';

export class DatabaseError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function getEntriesBySeason(season: Season): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('season', season)
    .order('created_at', { ascending: false });

  if (error) {
    throw new DatabaseError(`Failed to fetch entries: ${error.message}`, error.code);
  }

  return data as Entry[];
}

export async function getRandomEntry(season: Season): Promise<Entry | null> {
  const count = await getEntryCount(season);
  if (count === 0) return null;

  const offset = Math.floor(Math.random() * count);
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('season', season)
    .order('created_at', { ascending: false })
    .range(offset, offset);

  if (error) {
    throw new DatabaseError(`Failed to fetch random entry: ${error.message}`, error.code);
  }

  return (data?.[0] as Entry) ?? null;
}

export async function getEntryCount(season: Season): Promise<number> {
  const { count, error } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .eq('season', season);

  if (error) {
    throw new DatabaseError(`Failed to count entries: ${error.message}`, error.code);
  }

  return count ?? 0;
}

export const CARDS_PER_PAGE = 2;

export function getTotalPages(entryCount: number): number {
  return Math.ceil(entryCount / CARDS_PER_PAGE);
}

export async function getEntriesPage(season: Season, page: number): Promise<Entry[]> {
  const start = page * CARDS_PER_PAGE;
  const end = start + CARDS_PER_PAGE - 1;

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('season', season)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    throw new DatabaseError(`Failed to fetch entries: ${error.message}`, error.code);
  }

  return data as Entry[];
}

export async function addEntry(entry: NewEntry): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .insert([entry])
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to add entry: ${error.message}`, error.code);
  }

  return data as Entry;
}

export async function updateEntry(id: string, updates: UpdateEntry): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to update entry: ${error.message}`, error.code);
  }

  return data as Entry;
}
