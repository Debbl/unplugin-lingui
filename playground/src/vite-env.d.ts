/// <reference types="vite/client" />

declare module '*.po' {
  const content: Record<string, string>
  export default content
}
