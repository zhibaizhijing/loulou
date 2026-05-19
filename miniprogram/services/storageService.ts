import { __USE_MOCK__ } from '../utils/env'

export async function uploadImage(localPath: string, prefix = 'chat'): Promise<string> {
  const slug = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  if (__USE_MOCK__) {
    return `mock-file://${slug}`
  }
  const r = await wx.cloud.uploadFile({ cloudPath: slug, filePath: localPath })
  return r.fileID
}

export async function uploadImages(localPaths: string[], prefix = 'chat'): Promise<string[]> {
  return Promise.all(localPaths.map(p => uploadImage(p, prefix)))
}
