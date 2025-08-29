export interface ShortFileNameOptions {
  filename: string;
}

const isToday = (date: Date | string) => {
  const today = new Date()

  return (
    new Date(date).getDate() === today.getDate() &&
    new Date(date).getMonth() === today.getMonth() &&
    new Date(date).getFullYear() === today.getFullYear()
  )
}

export const formatDateToMonthShort = (value: Date | string, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: 'numeric', minute: 'numeric' }
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

export const getShortFileName = (filename: string): string => {
  if (!filename) return '';
  const parts = filename.split('.');
  const ext = parts.pop(); // get extension
  const base = parts.join('.'); // get name without extension
  const shortBase = base.length > 30 ? base.slice(0, 20) + '...' : base;
  return `${shortBase}.${ext}`;
};