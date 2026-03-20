import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Entry, RealtimePayload } from '../types';

type RealtimeCallback = (payload: RealtimePayload) => void;

let channel: RealtimeChannel | null = null;

export function subscribeToEntries(callback: RealtimeCallback): () => void {
  if (channel) {
    channel.unsubscribe();
  }

  channel = supabase
    .channel('entries-realtime')
    .on<Entry>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'entries',
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Entry | null,
          old: payload.old as Entry | null,
        });
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Realtime subscription error');
        setTimeout(() => subscribeToEntries(callback), 5000);
      }
    });

  return () => {
    if (channel) {
      channel.unsubscribe();
      channel = null;
    }
  };
}

export function isConnected(): boolean {
  return channel?.state === 'joined';
}
