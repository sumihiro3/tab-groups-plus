global.chrome = {
  tabs: {
    create: async () => {
      throw new Error('Unimplemented.');
    },
    group: async () => {
      throw new Error('Unimplemented.');
    },
    query: async () => {
      throw new Error('Unimplemented.');
    },
  },
  tabGroups: {
    update: async () => {
      throw new Error('Unimplemented.');
    },
    move: async () => {
      throw new Error('Unimplemented.');
    },
  },
  storage: {
    sync: {
      get: async () => {
        throw new Error('Unimplemented.');
      },
      set: async () => {
        throw new Error('Unimplemented.');
      },
    },
  },
  windows: {
    create: async () => {
      throw new Error('Unimplemented.');
    },
    update: async () => {
      throw new Error('Unimplemented.');
    },
    get: async () => {
      throw new Error('Unimplemented.');
    },
  },
};
