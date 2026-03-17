import type { Like2DEvent, EventMap, EventType } from './core/events';
import type { Like } from './core/like';
type EventHandler<K extends EventType> = (like: Like, ...args: EventMap[K]) => void;
export type Scene = {
    [K in EventType]?: EventHandler<K>;
} & {
    handleEvent?(like: Like, event: Like2DEvent): void;
};
export {};
//# sourceMappingURL=scene.d.ts.map