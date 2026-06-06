import type { Area } from 'react-easy-crop'

/**
 * Carga una imagen desde una URL (object URL o data URL) como HTMLImageElement.
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (err) => reject(err))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

/**
 * Recorta una imagen según el área (en px) entregada por react-easy-crop y
 * devuelve un Blob JPEG listo para subir. Redimensiona el lado mayor a un
 * máximo razonable para que no pesen de más.
 */
export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  maxDimension = 1600,
  quality = 0.85,
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2d context')

  // Escala para limitar el lado mayor a maxDimension
  let targetW = pixelCrop.width
  let targetH = pixelCrop.height
  const longest = Math.max(targetW, targetH)
  if (longest > maxDimension) {
    const ratio = maxDimension / longest
    targetW = Math.round(targetW * ratio)
    targetH = Math.round(targetH * ratio)
  }

  canvas.width = targetW
  canvas.height = targetH

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetW,
    targetH,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas vacío'))
      },
      'image/jpeg',
      quality,
    )
  })
}

/** Convierte un Blob a File con nombre. */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type })
}
