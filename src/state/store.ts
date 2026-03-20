import type { AppState, Entry, Season, Author } from '../types';

type Listener = () => void;

class Store {
  private state: AppState = {
    currentUser: null,
    currentSeason: null,
    entries: new Map(),
    isLoading: false,
    error: null,
  };

  private listeners: Set<Listener> = new Set();

  getState(): AppState {
    return this.state;
  }

  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  setCurrentUser(user: Author | null): void {
    this.setState({ currentUser: user });
    if (user) {
      sessionStorage.setItem('currentUser', user);
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(): Author | null {
    if (!this.state.currentUser) {
      const stored = sessionStorage.getItem('currentUser');
      if (stored === 'Viv' || stored === 'Bili') {
        this.state.currentUser = stored;
      }
    }
    return this.state.currentUser;
  }

  setEntriesForSeason(season: Season, entries: Entry[]): void {
    const newMap = new Map(this.state.entries);
    newMap.set(season, entries);
    this.setState({ entries: newMap });
  }

  getEntriesForSeason(season: Season): Entry[] {
    return this.state.entries.get(season) || [];
  }

  addEntry(entry: Entry): void {
    const entries = this.getEntriesForSeason(entry.season);
    this.setEntriesForSeason(entry.season, [entry, ...entries]);
  }

  updateEntry(entry: Entry): void {
    const entries = this.getEntriesForSeason(entry.season);
    const index = entries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      const newEntries = [...entries];
      newEntries[index] = entry;
      this.setEntriesForSeason(entry.season, newEntries);
    }
  }

  removeEntry(id: string, season: Season): void {
    const entries = this.getEntriesForSeason(season);
    this.setEntriesForSeason(season, entries.filter(e => e.id !== id));
  }
}

export const store = new Store();
