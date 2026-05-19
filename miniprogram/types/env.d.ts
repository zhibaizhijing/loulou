declare const __DEV__: boolean | undefined

declare module '*.json' {
  const value: unknown
  export default value
}

declare global {
  interface IAppOption {
    globalData: {
      openid: string
      bootError: Error | null
    }
  }
}

export {}
