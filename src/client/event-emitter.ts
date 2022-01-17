type EventCallback = (...args: any[]) => void;

interface EventStore {
  [key: string]: EventCallback[];
}

export default class EventEmitter {
  #events: EventStore = {};

  on(key: string, fn: EventCallback) {
    if (!this.#events[key]) {
      this.#events[key] = [];
    }

    this.#events[key].push(fn);
  }

  one(key: string, fn: EventCallback) {
    if (!this.#events[key]) {
      this.#events[key] = [];
    }

    const wrapper = (...args: any[]) => {
      fn(...args);
      this.off(key, wrapper);
    };

    this.#events[key].push(wrapper);
  }

  off(key: string, fn: EventCallback) {
    const index = this.#events[key].indexOf(fn);
    this.#events[key].splice(index, 1);
  }

  emit(key: string, ...args: any[]) {
    (this.#events[key] || []).forEach((fn) => fn(...args));
  }
}
