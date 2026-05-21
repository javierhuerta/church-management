import { EventType } from '../entities/event-type.enum';

const UNSPLASH_PARAMS = 'w=1600&h=900&fit=crop&q=80&auto=format';

export function defaultCoverForType(type: EventType): string {
  switch (type) {
    case EventType.Asach:
      // Conference / gathering of people
      return `https://images.unsplash.com/photo-1505373877841-8d25f7d46678?${UNSPLASH_PARAMS}`;
    case EventType.Distrital:
      // Outdoor camp / mountain retreat
      return `https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?${UNSPLASH_PARAMS}`;
    case EventType.Local:
    default:
      // Bible open in hands
      return `https://images.unsplash.com/photo-1504052434569-70ad5836ab65?${UNSPLASH_PARAMS}`;
  }
}
