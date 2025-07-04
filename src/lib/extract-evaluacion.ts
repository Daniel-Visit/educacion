// Utilidad para extraer preguntas y alternativas de un JSON TipTap

export type AlternativaExtraida = {
  letra: string
  texto: string
}

export type PreguntaExtraida = {
  numero: number
  texto: string
  alternativas: AlternativaExtraida[]
}

/**
 * Extrae preguntas y alternativas desde un JSON TipTap de evaluación.
 * Soporta alternativas en taskList, bulletList o párrafos, y limpia el texto de la alternativa.
 */
export function extraerPreguntasAlternativas(json: any): PreguntaExtraida[] {
  const preguntas: PreguntaExtraida[] = []
  const content = json.content || []
  let preguntaNumero = 1
  let i = 0

  while (i < content.length) {
    const node = content[i]

    // Detectar pregunta (orderedList, listItem, o párrafo con número)
    let textoPregunta = ""
    if (node.type === "orderedList" && node.content?.[0]?.content?.[0]?.content?.[0]?.text) {
      textoPregunta = node.content[0].content[0].content[0].text
    } else if (node.type === "paragraph" && /^\d+\./.test(node.content?.[0]?.text || "")) {
      textoPregunta = node.content[0].text.replace(/^\d+\.\s*/, "")
    }

    if (textoPregunta) {
      // Buscar alternativas en los siguientes nodos
      const alternativas: AlternativaExtraida[] = []
      let j = i + 1
      while (j < content.length) {
        const altNode = content[j]
        let altTexts: string[] = []

        // TaskList o BulletList
        if (altNode.type === "taskList" || altNode.type === "bulletList") {
          altTexts = altNode.content.map(
            (item: any) => item.content?.[0]?.content?.[0]?.text || ""
          )
        }
        // Párrafos sueltos
        else if (altNode.type === "paragraph" && altNode.content?.[0]?.text) {
          altTexts = [altNode.content[0].text]
        }

        // Extraer alternativas válidas
        let foundAlt = false
        for (const altText of altTexts) {
          const match = altText.match(/^([a-zA-Z])\.\s*(.*)$/)
          if (match) {
            alternativas.push({ letra: match[1], texto: match[2] })
            foundAlt = true
          }
        }

        if (!foundAlt) break // Si no hay más alternativas, salir

        j++
      }

      preguntas.push({
        numero: preguntaNumero,
        texto: textoPregunta,
        alternativas
      })
      preguntaNumero++
      i = j
    } else {
      i++
    }
  }
  return preguntas
} 