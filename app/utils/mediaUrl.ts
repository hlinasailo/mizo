export const resolveMediaUrl = (url?: string | null): string | null => {
  if (!url) {
    return null
  }

  const trimmed = String(url).trim()

  if (!trimmed) {
    return null
  }

  if (/^(data:|blob:|https?:\/\/)/i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase.replace(/\/$/, '')
  const configuredMediaBase = String(config.public.mediaBase || '').trim()
  const mediaBase = (configuredMediaBase || `${apiBase}/media`).replace(/\/$/, '')
  const normalized = trimmed.replace(/^\/+/, '')

  if (normalized.startsWith('media/')) {
    if (configuredMediaBase) {
      return `${mediaBase}/${normalized.replace(/^media\//, '')}`
    }

    return `${apiBase}/${normalized}`
  }

  return `${mediaBase}/${normalized}`
}