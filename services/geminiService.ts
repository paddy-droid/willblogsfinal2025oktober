import { GoogleGenAI, Modality, GenerateContentResponse, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { GroundingChunk } from "../types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const conductResearch = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Führe eine tiefgehende Webrecherche zum Thema "${topic}" durch. Deine oberste Priorität ist die Glaubwürdigkeit und Autorität der Quellen.
**Zusätzlich musst du sicherstellen, dass nur moderne, wissenschaftlich fundierte Terminologien und Konzepte verwendet werden. Veraltete oder widerlegte Theorien (wie z.B. Dominanztheorie, Rudelführer-Konzepte) sind strikt zu vermeiden.** Der Fokus liegt auf positiver Verstärkung und tierschutzkonformen Ansätzen, wie sie im "Willenskraft"-Branding verankert sind.

**Erlaubte Quellen:**
*   Wissenschaftliche Studien und Forschungsartikel (z.B. aus PubMed, Google Scholar).
*   Publikationen von hoch angesehenen Institutionen (z.B. Universitäten, anerkannte Forschungsinstitute, staatliche Gesundheitsorganisationen).
*   Artikel aus etablierten, renommierten Fachmagazinen.

**Verbotene Quellen:**
*   **Jegliche kommerzielle Websites, Online-Shops oder Marken-Seiten.**
*   Allgemeine Blogs, Foren oder Meinungsartikel von nicht verifizierten Autoren.
*   Soziale Medien und nutzergenerierte Inhalte.

**Formatierungsanforderungen:**
Formatiere deine gesamte Ausgabe als sauberes, gut lesbares HTML. Verwende die folgenden Tags, um die Ergebnisse zu strukturieren und die Lesbarkeit zu maximieren:
- **<h2>**: Eine klare Hauptüberschrift für das Forschungsergebnis.
- **<h3>**: Aussagekräftige Zwischenüberschriften für die verschiedenen Unterthemen oder Studienergebnisse.
- **<ul> und <li>**: Präsentiere die 3-4 wichtigsten Kernaussagen ("Key Takeaways") direkt am Anfang als übersichtliche Liste.
- **<p>**: Fließtext für detailliertere Erklärungen.
- **<strong>**: Hebe die wichtigsten Schlüsselwörter, Daten, Namen oder Fakten hervor, um das Scannen des Textes zu erleichtern.

Strukturiere den Bericht logisch und beginne mit den wichtigsten Erkenntnissen. Gib NUR den HTML-Inhalt aus.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error("Error during web research:", error);
    throw new Error("Fehler bei der Webrecherche. Bitte versuchen Sie es erneut.");
  }
};

export const createOutline = async (topic: string, research: string, sources: GroundingChunk[], internalLinks: string[]) => {
  try {
    const sourceList = sources
        .map(s => s.web ? `- ${s.web.title}: ${s.web.uri}` : '')
        .filter(Boolean)
        .join('\n');

    const prompt = `Basierend auf der folgenden Recherche und den Quellen:
---
**Rechercheergebnis:**
${research}
---
**Quellen:**
${sourceList}
---
Erstelle eine detaillierte, gut strukturierte Gliederung für einen Blogartikel zum Thema "${topic}". Deine Hauptaufgabe ist es, die wissenschaftlichen Erkenntnisse aus der Recherche in eine kohärente Struktur zu bringen, die der Kernphilosophie von "Willenskraft" entspricht.

**Zentrale Anforderungen an die Gliederung:**

1.  **Synthese der Forschung:** Die Gliederung muss die wichtigsten wissenschaftlichen Fakten und Erkenntnisse aus dem Rechercheergebnis logisch anordnen und als Hauptpunkte des Artikels verwenden. Es soll kein generischer Artikel sein, sondern direkt auf den gelieferten Forschungsergebnissen aufbauen.

2.  **Integration der "Willenskraft"-Philosophie:** Die Willenskraft-Grundsätze sind nicht nur eine stilistische Vorgabe, sondern die Kernphilosophie, die die gesamte Argumentation und den Aufbau des Artikels prägen muss.
    *   **Rahmen:** Präsentiere die wissenschaftlichen Fakten durch die "Willenskraft"-Brille: ganzheitlich, modern, positiv, Fokus auf die Mensch-Hund-Beziehung.
    *   **Lösungsorientierung:** Strukturiere die Punkte so, dass sie praktische, positive und tierschutzkonforme Lösungen aufzeigen, die auf den wissenschaftlichen Erkenntnissen basieren.
    *   **Terminologie:** Verwende durchgehend die moderne, positive Terminologie, die in der Recherche verwendet wird.

3.  **SEO & Verlinkungen:**
    *   Schlage einen ansprechenden SEO-Titel und eine Meta-Beschreibung (max. 160 Zeichen) vor.
    *   Liste 5-7 relevante Keywords.
    *   Baue 2-3 relevante interne Links (${internalLinks.join(', ')}) und EINEN wichtigen externen Link aus den Quellen an passenden Stellen ein.

4.  **Format:** Die gesamte Ausgabe MUSS im HTML-Format sein. Verwende Tags wie \`<h2>\`, \`<h3>\`, \`<p>\`, \`<ul>\`, \`<li>\`, \`<a>\` und \`<strong>\`.

**Struktur der Ausgabe:**
*   SEO-Titel, Meta-Beschreibung, Keywords
*   Einleitung (H1-Titel des Artikels hier)
*   Hauptpunkte (als H2 oder H3, basierend auf der Recherche)
*   Fazit`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Using Pro for better instruction following on complex tasks
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error creating outline:", error);
    throw new Error("Fehler bei der Erstellung der Gliederung.");
  }
};

export const generateContentPart = async (
  topic: string, 
  outline: string, 
  previousContent: string, 
  part: number
) => {
  try {
    let prompt;
    const baseInstructions = `**Wichtige Anforderungen:**
1.  **Branding "Willenskraft":** Der Ton muss fesselnd, professionell, informativ und im Einklang mit dem Willenskraft-Branding sein (ganzheitlich, positiv, Fokus auf "Mensch-und-Hund-Team").
2.  **Format:** Der gesamte Text MUSS im HTML-Format geschrieben werden. Verwende korrekte HTML-Tags wie \`<p>\`, \`<strong>\` für Hervorhebungen, \`<h2>\`, \`<h3>\` für Überschriften und \`<a>\` für Links, falls in diesem Abschnitt welche vorgesehen sind. KEIN MARKDOWN VERWENDEN.
3.  **Ansprache:** Verwende durchgehend die informelle "Du"-Ansprache, um den Leser direkt und persönlich anzusprechen.`;

    switch (part) {
      case 1:
        prompt = `Basierend auf der folgenden Gliederung und SEO-Vorgaben im HTML-Format:
---
${outline}
---
Schreibe den ersten Teil des Blogartikels zum Thema "${topic}": die Einleitung und den ersten Hauptpunkt der Gliederung.
**Die Einleitung muss besonders fesselnd ("catchy") sein.** Sie soll den Leser sofort abholen, das Hauptproblem oder die zentrale Frage des Artikels umreißen, die wichtigsten Vorteile des Lesens kurz zusammenfassen und Lust auf den gesamten Artikel machen.
${baseInstructions}`;
        break;
      case 2:
        prompt = `Hier ist der bisher geschriebene Teil des Artikels:
---
${previousContent}
---
Und hier ist die Gliederung:
---
${outline}
---
Schreibe nun den mittleren Teil des Artikels zum Thema "${topic}". Konzentriere dich **ausschließlich** auf die nächsten 2-3 Hauptpunkte der Gliederung. **Wiederhole keine Informationen, die bereits im vorherigen Teil enthalten sind.** Setze nahtlos am bisherigen Text an.
${baseInstructions}`;
        break;
      case 3:
      default:
        prompt = `Hier ist der bisher geschriebene Artikel:
---
${previousContent}
---
Und hier ist die Gliederung:
---
${outline}
---
Schreibe den letzten Teil des Artikels zum Thema "${topic}". Konzentriere dich **ausschließlich** auf den letzten Hauptpunkt, das Fazit und einen passenden Call-to-Action. **Wiederhole keine Informationen aus den vorherigen Teilen.** Runde den Artikel schlüssig ab.
${baseInstructions}`;
        break;
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`Error generating content part ${part}:`, error);
    throw new Error(`Fehler bei der Erstellung von Teil ${part} des Artikels.`);
  }
};

export const reviseContent = async (originalContent: string, feedback: string) => {
  const prompt = `
    Aufgabe: Überarbeite den folgenden Originaltext basierend auf den Anweisungen des Benutzers.

    **Originaltext:**
    ---
    ${originalContent}
    ---

    **Anweisungen des Benutzers zur Überarbeitung:**
    ---
    ${feedback}
    ---

    Bitte gib die vollständig überarbeitete Version des Textes aus, die die Anweisungen des Benutzers berücksichtigt. Halte das ursprüngliche Format (z.B. HTML) und die informelle "Du"-Ansprache bei. Gib NUR den überarbeiteten Text aus.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error revising content:", error);
    throw new Error("Fehler bei der Überarbeitung des Inhalts.");
  }
};

const parseImageResponse = (response: GenerateContentResponse, imageType: string): string => {
    const candidate = response.candidates?.[0];
    if (!candidate) {
        throw new Error(`${imageType} image generation failed: No candidate returned from API.`);
    }

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`${imageType} image generation failed. Reason: ${candidate.finishReason}. This may be due to safety settings.`);
    }

    for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
            return part.inlineData.data;
        }
    }
    
    throw new Error(`${imageType} image could not be extracted from the response.`);
}

export const generateImageFromPrompt = async (prompt: string, referenceImage?: {data: string, mimeType: string}): Promise<string> => {
    try {
        const contentParts: any[] = [{ text: prompt }];

        if (referenceImage) {
            contentParts.unshift({
                inlineData: {
                    data: referenceImage.data,
                    mimeType: referenceImage.mimeType,
                }
            })
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: contentParts },
            config: {
                responseModalities: [Modality.IMAGE],
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            },
        });
        return parseImageResponse(response, 'Generated');
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error(`Fehler bei der Bilderstellung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
};


export const generateProductionHtml = async (articleContent: string) => {
  const prompt = `
  Du bist ein Experte für Webdesign und Frontend-Entwicklung mit Spezialisierung auf die Marke "Willenskraft Hundeschule". Deine Aufgabe ist es, den rohen HTML-Inhalt eines Blogartikels in einen wunderschönen, markengerechten und in sich geschlossenen HTML-Block zu verwandeln, der direkt in einen WordPress Custom HTML Block eingefügt werden kann.

  **WICHTIGSTE REGEL: Gib KEINE \`<html>\`, \`<head>\` oder \`<body>\` Tags aus. Der gesamte Output muss ein einzelner, in sich geschlossener Block sein, der mit einem Container-\`<div>\` beginnt.**

  **WordPress-Kompatibilitätsanforderungen:**
  1. **Ohne Skript:** Entferne alle <script>-Tags und JavaScript-Funktionalitäten, da diese von WP gefiltert werden
  2. **Styles im Block:** Behalte ein einziges <style>-Tag direkt im "Benutzerdefiniertes HTML"-Block
  3. **Robuste Fallback-Selektoren:** Implementiere alle CSS-Selektoren mit dem robusten Fallback-System, das in allen WordPress-Themes funktioniert
  4. **Icon sicher gelöst:** Implementiere das Pfoten-Icon als <span class="paw">🐾</span> statt ::before
  5. **Full-Bleed am Desktop:** Implementiere Container mit width:100vw und margin-left/right: calc(50% - 50vw)
  6. **Lesbarkeit innen:** Implementiere .willenskraft-article-inner mit max-width:1200px + Padding
  7. **Animation ohne JS:** Ersetze JavaScript durch CSS-Keyframe fadeUp mit gestaffeltem animation-delay für .fade-in-element-Klassen

  **Branding-Richtlinien ("Willenskraft Hundeschule"):**
  - **Thema:** Hell, freundlich, modern und professionell.
  - **Farbpalette:**
    - Hintergrund: \`#FFFFFF\` (Weiß)
    - Text: \`#000000\` (Schwarz)
    - Primäre Highlight-Farbe (für Ränder, Icons, Links): \`#E58E1A\` (Willenskraft Orange)
    - CTA-Button Hintergrund: Ein freundliches Grün (z.B. \`#22c55e\`) mit weißem Text.
  - **Schriften:** Verwende eine saubere, gut lesbare serifenlose Schriftart wie 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'.
  - **Stil:** Große, klare Sektionen mit viel Weißraum. Freundlich und persönlich.

  **Technische & gestalterische Anforderungen:**
  1.  **Struktur:**
      - Beginne mit einem Hauptcontainer, z.B. \`<div class="willenskraft-article-container">\`.
      - Platziere ein \`<style>\` Tag GANZ OBEN innerhalb dieses Containers. Hier kommt das gesamte CSS hinein.
      - KEINE <script>-Tags oder JavaScript-Code!
  2.  **Design-Elemente (Style diese im CSS mit WordPress-kompatiblen Selektoren):**
      - **Info-Boxen:** Erstelle mindestens eine auffällige Klasse für besondere Hinweise, z.B. \`.willenskraft-box\`. Diese Boxen sollen einen weichen Schatten (\`box-shadow\`), abgerundete Ecken, einen linken Rand in der Highlight-Farbe Orange (\`border-left: 4px solid #E58E1A\`) und einen leichten "Anhebe"-Effekt beim Darüberfahren (\`transform: translateY(-5px)\`) haben.
      - **Listen:** Style Listen so, dass sie anstelle von normalen Punkten ein passendes Icon oder Emoji verwenden (z.B. ein Häkchen-Icon ✓ oder ein Pfoten-Emoji 🐾 in der Highlight-Farbe Orange).
      - **Call-to-Action (CTA):** Entwirf am Ende des Artikels einen klaren, einladenden CTA-Block. Er sollte eine Überschrift und einen Button im markengerechten Grün haben.
  3.  **Robuste Fallback-Selektoren (WICHTIG!):**
      - Verwende für ALLE CSS-Selektoren das folgende Fallback-Muster, das in allen WordPress-Themes funktioniert:
      
      \`\`\`css
      /* WRAPPER-FALLBACK:
         - Greift in gängigen Themes/Editoren (Block-Theme, Classic, Page-Builder)
         - UND direkt ohne Wrapper (zweite Zeile) */
      :is(.entry-content,.wp-block-post-content,.post-content,.wp-block-group,.prose,body) .willenskraft-article-container,
      .willenskraft-article-container {
        /* Stile hier */
      }
      \`\`\`
      
      - Wende dieses Muster auf ALLE CSS-Selektoren an:
        * Container-Selektoren (.willenskraft-article-container)
        * Full-Bleed-Selektoren
        * Typography-Selektoren
        * Link-Selektoren
        * Icon-Selektoren (.paw)
        * Listen-Selektoren
        * Info-Box-Selektoren (.willenskraft-box)
        * CTA-Selektoren
        * Animations-Selektoren (.fade-in-element)
      
      - Jeder Selektor muss sowohl die Fallback-Variante mit den möglichen Wrappern als auch die direkte Variante ohne Wrapper enthalten
  4.  **Full-Bleed-Container:**
      - Full-Bleed-Container mit width:100vw und margin-left/right: calc(50% - 50vw)
      - Innerer Container mit max-width:1200px + Padding für Lesbarkeit
  5.  **CSS-Animationen:**
      - CSS-Animationen mit @keyframes fadeUp und gestaffeltem animation-delay
  6.  **Icon-Implementierung:**
      - Verwende <span class="paw">🐾</span> statt ::before-Pseudo-Elementen
      - Style die .paw-Klasse entsprechend im CSS mit dem Fallback-System
  7.  **Keine Bild-Platzhalter:** Füge keine Kommentare für Bilder ein.

  **Eingabe-Artikel HTML (Rohfassung):**
  ---
  ${articleContent}
  ---
  
  Erstelle jetzt den finalen, in sich geschlossenen HTML-Block. Beginne direkt mit dem Container-\`<div>\`.
  `;

  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
      });
      let htmlCode = response.text;
      // Clean up potential markdown formatting from the response
      if (htmlCode.startsWith('```html')) {
          htmlCode = htmlCode.substring(7);
      }
      if (htmlCode.endsWith('```')) {
          htmlCode = htmlCode.slice(0, -3);
      }
      return htmlCode.trim();
  } catch (error) {
      console.error("Error generating production HTML:", error);
      throw new Error("Fehler bei der Erstellung des finalen HTML-Codes.");
  }
};