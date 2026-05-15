import type { ServiceProgramResponseDto } from '@/lib/api'

export async function downloadProgramPdf(program: ServiceProgramResponseDto) {
  const [{ pdf }, { createElement }, { ProgramPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('react'),
    import('../components/program-pdf-document'),
  ])

  const element = createElement(ProgramPdfDocument, { program })
  // pdf() expects DocumentProps but accepts any element that renders a Document at root
  const blob = await pdf(element as never).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `programa-${program.date}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
