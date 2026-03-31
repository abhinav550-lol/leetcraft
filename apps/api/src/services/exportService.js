import PDFDocument from 'pdfkit'

export const exportMarkdown = (markdown) => Buffer.from(markdown)

export const exportPdf = async (markdown) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const lines = markdown.split('\n')

      for (const line of lines) {
        if (line.startsWith('# ')) {
          doc.fontSize(22).font('Helvetica-Bold').text(line.slice(2), { paragraphGap: 8 })
        } else if (line.startsWith('## ')) {
          doc.moveDown(0.5)
          doc.fontSize(16).font('Helvetica-Bold').text(line.slice(3), { paragraphGap: 6 })
        } else if (line.startsWith('```')) {
          // skip code fence markers
        } else if (line.trim() === '') {
          doc.moveDown(0.3)
        } else {
          doc.fontSize(11).font('Helvetica').text(line, { paragraphGap: 2, lineGap: 2 })
        }
      }

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
