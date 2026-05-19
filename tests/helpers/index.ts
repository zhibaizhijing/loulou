export * from './wxMock'

export function mockCollection(records: any[]) {
  const filtered = [...records]
  return {
    where: () => mockCollection(filtered),
    orderBy: () => mockCollection(filtered),
    limit: () => mockCollection(filtered),
    get: async () => ({ data: filtered }),
    doc: (id: string) => ({
      get: async () => {
        const r = filtered.find(x => x._id === id)
        if (!r) throw new Error('not found')
        return { data: r }
      }
    }),
    watch: () => ({ close: () => undefined })
  }
}
