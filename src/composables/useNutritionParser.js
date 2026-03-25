export function useNutritionParser() {
  /**
   * Refactored parsing logic optimized for Caloric Surplus and Mass-Building.
   * Prioritizes the 5 main tags using strict regex anchoring against
   * expected structural grammar (e.g. matching numbers *before* "Added Sugars").
   * @param {String} rawText - The text result from Tesseract.js
   * @returns {Object} - Structured nutrition data prioritizing mass metrics
   */
  const parseText = (rawText) => {
    if (!rawText) return {}

    // 1. Clean and normalize (lower case and strip tiny noisy artifacts)
    const lines = rawText.split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => line.length > 2)
    const cleanedText = lines.join(' ')

    // 2. Extract strictly the five targeted nutritional markers
    return {
      calories: findCalories(cleanedText),
      totalFat: findTotalFat(cleanedText),
      protein: findProtein(cleanedText),
      totalCarbohydrate: findTotalCarbs(cleanedText),
      addedSugars: findAddedSugars(cleanedText)
    }
  }

  // Energy
  const findCalories = (text) => {
    // Focus strictly on the "Calories" header, grab the first integer that follows
    const match = text.match(/calories\D*?(\d+)/i)
    return match ? { value: match[1], unit: '', percentDV: null } : null
  }

  const findTotalFat = (text) => {
    // Looks for 'total fat' optionally followed by non-digits, captures gram amount,
    // then optionally looks ahead for a percentage value
    // Target: "Total Fat 9g 12%"
    const match = text.match(/total\s*fat\D*?(\d+(?:\.\d+)?)\s*g.*?(\d+)\s*%/i)
    if (match) {
      return { value: match[1], unit: 'g', percentDV: match[2] }
    }
    
    // Fallback: If no % is read by OCR, still capture the grams
    const gramMatch = text.match(/total\s*fat\D*?(\d+(?:\.\d+)?)\s*g/i)
    return gramMatch ? { value: gramMatch[1], unit: 'g', percentDV: null } : null
  }

  // Mass
  const findProtein = (text) => {
    // Protein is usually straightforward, typically no %DV is listed next to it
    const match = text.match(/protein\D*?(\d+(?:\.\d+)?)\s*g/i)
    return match ? { value: match[1], unit: 'g', percentDV: null } : null
  }

  const findTotalCarbs = (text) => {
    // Target: "Total Carbohydrate 13g" or "Total Carb. 13g"
    const match = text.match(/total\s*carb(?:ohydrate)?\D*?(\d+(?:\.\d+)?)\s*g/i)
    return match ? { value: match[1], unit: 'g', percentDV: null } : null
  }

  // Quality Control
  const findAddedSugars = (text) => {
    // Target: "Includes 0g Added Sugars"
    // The critical piece here is capturing the number immediately *preceding* the "added" keyword
    const match = text.match(/(\d+(?:\.\d+)?)\s*g\s*added/i)
    return match ? { value: match[1], unit: 'g', percentDV: null } : null
  }

  return { parseText }
}
