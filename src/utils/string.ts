export const ensurePrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str : `${prefix}${str}`)
export const withoutSuffix = (str: string, suffix: string) =>
  str.endsWith(suffix) ? str.slice(0, -suffix.length) : str
export const withoutPrefix = (str: string, prefix: string) => (str.startsWith(prefix) ? str.slice(prefix.length) : str)

export const hyphenRemove = (str: string): string => {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

export const lastWord = (str: string): string => {
  const words = str.trim().split(/\s+/)
  const last = words[words.length - 1] || ''
  return last.charAt(0).toUpperCase() + last.slice(1)
}

// export const capitalization = (str:string):string =>(str) =>(str.)
