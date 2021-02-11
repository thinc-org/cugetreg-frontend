import { TFunction } from 'i18next'

export const mapTextToTranslated = (namespace: string, texts: string[], t: TFunction) => {
  return texts.map((text) => ({
    value: text,
    translatedText: t(`${namespace}:${text}` as const),
  }))
}
