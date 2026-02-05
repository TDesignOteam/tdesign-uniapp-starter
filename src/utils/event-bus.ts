interface EventBus {
  events: Record<string, Function[]>;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback?: Function) => void;
  emit: (event: string, ...args: any[]) => void;
}

export default function createBus(): EventBus {
  return {
    events: {},
    on(event: string, callback: Function) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(callback);
    },
    off(event: string, callback?: Function) {
      if (!this.events[event]) return;
      if (!callback) this.events[event] = [];
      else {
        const index = this.events[event].indexOf(callback);
        if (index !== -1) this.events[event].splice(index, 1);
      }
    },
    emit(event: string, ...args: any[]) {
      if (this.events[event]) this.events[event].forEach((callback) => callback(...args));
    },
  };
}
