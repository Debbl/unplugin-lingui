export async function load() {
  return (await import('./locale/en.json')).default
}
