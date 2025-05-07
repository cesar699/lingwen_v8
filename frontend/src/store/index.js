import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  state: () => ({
    novelMeta: {},
    chapters: [],
    settings: [],
    schedule: [],
  }),
  actions: {
    setMeta(meta) { this.novelMeta = meta; },
    setChapters(list) { this.chapters = list; },
    setSettings(list) { this.settings = list; },
    setSchedule(list) { this.schedule = list; },
  }
});
