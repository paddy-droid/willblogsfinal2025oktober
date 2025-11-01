import { GoogleGenAI, Modality, GenerateContentResponse, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { GroundingChunk } from "../types";

// API-Schlüssel wird lazy loading geholt, um Build-Probleme zu vermeiden
let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    // API-Key wird nur zur Laufzeit von Netlify Environment Variables injected
    // Für lokale Entwicklung muss die Variable manuell im Window-Objekt gesetzt werden
    const apiKey = (window as any).VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure Netlify Environment Variables.");
    }
    
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const conductResearch = async (topic: string) => {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Führe eine tiefgehende Webrecherche zum Thema "${topic}" durch. Deine oberste Priorität ist die Glaubwürdigkeit und Autorität der Quellen.
**Zusätzlich musst du sicherstellen, dass nur moderne, wissenschaftlich fundierte Terminologien und Konzepte verwendet werden. Veraltete oder widerlegte Theorien (wie z.B. Dominanztheorie, Rudelführer-Konzepte) sind strikt zu vermeiden.** Der Fokus liegt auf positiver Verstärkung und tierschutzkonformen Ansätzen, wie sie im "Willenskraft"-Branding verankert sind.

**Erlaubte Quellen:**
*   Wissenschaftliche Studien und Forschungsartikel (z.B. aus PubMed, Google Scholar).
*   Publikationen von hoch angesehenen Institutionen (z.B. Universitäten, anerkannte Forschungsinstitute, staatliche Gesundheitsorganisationen).
*   Artikel aus etablierten, renommierten Fachmagazinen.
*   Aktuelle Artikel von angesehenen Institutionen (z.B. Universitäten, anerkannte Forschungsinstitute, staatliche Gesundheitsorganisationen).
*   Fachartikel aus etablierten, renommierten Fachmagazinen.

**Verbotene Quellen:**
*   Forenbeiträge, Social Media Posts, oder nicht verifizierte Blogs.
*   Kommerzielle Websites ohne wissenschaftlichen Hintergrund.
*   Veraltete Forschung (älter als 10 Jahre, es sei denn, es handelt sich um grundlegende Studien).

**Strukturierung der Recherche:**
1.  **Synthese der Forschung:** Fasse die wichtigsten wissenschaftlichen Erkenntnisse zusammen.
2.  **Integration der "Willenskraft"-Philosophie:** Erkläre, wie die Forschungsergebnisse zur positiven Verstärkung und tierschutzkonformen Ausbildung passen.
3.  **SEO & Verlinkung:** Erstelle eine Liste mit 5-7 relevanten Keywords und 2-3 internen Links (${(window as any).VITE_INTERNAL_LINKS || 'https://www.willenskraft.co.at/'}) zu passenden Artikeln.

**Formatierung der Ausgabe:**
Strukturiere deine Antwort klar und präzise. Verwende Absätze, um die verschiedenen Aspekte deiner Recherche voneinander zu trennen.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text, sources };
  }
  catch (error) {
    console.error("Error during web research:", error);
    throw new Error("Fehler bei der Webrecherche. Bitte versuchen Sie es später erneut.");
  }
};

export const createOutline = async (topic: string, research: string, sources: GroundingChunk[], internalLinks: string[]) => {
  try {
    const sourceList = sources
      .map(s => s.web ? `- ${s.web.title}: ${s.web.uri}` : '')
      .filter(Boolean)
      .join('\n');
    
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Basierend auf der folgenden Recherche erstelle eine detaillierte Gliederung für einen Blogartikel zum Thema "${topic}":

**Rechercheergebnisse:**
${research}

**Quellen:**
${sourceList}

**Interne Links:**
${internalLinks.join(', ')}

**Anforderungen an die Gliederung:**
1.  **SEO-optimierte Struktur:** Klarer Titel (H1), gefolgt von logischen Abschnitten (H2, H3).
2.  **Inhaltliche Tiefe:** Jeder Abschnitt soll konkrete, umsetzbare Informationen enthalten.
3.  **Integration der "Willenskraft"-Philosophie:** Positiver Ansatz, wissenschaftlich fundiert, tierschutzkonform.
4.  **Lesbarkeit:** Kurze, prägnante Absätze und klare Handlungsaufforderungen.

**Erwartete Gliederung:**
- SEO-Titel (H1)
- Einleitung (H2)
- 3-4 Hauptabschnitte (H2/H3)
- Fazit (H2)
- Meta-Informationen (SEO-Title, Beschreibung, Keywords)`,
    });
    return response.text;
  }
  catch (error) {
    console.error("Error during outline creation:", error);
    throw new Error("Fehler bei der Gliederungserstellung. Bitte versuchen Sie es später erneut.");
  }
};

export const generateContentPart = async (topic: string, outline: string, previousContent: string, part: number) => {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Schreibe Teil ${part} des Blogartikels zum Thema "${topic}" basierend auf der folgenden Gliederung:

**Gliederung:**
${outline}

**Bisher geschriebener Inhalt:**
${previousContent}

**Anforderungen für diesen Teil:**
- Schreibe nur den nächsten Abschnitt der Gliederung
- Behalte den positiven, wissenschaftlichen Ton bei
- Integriere die "Willenskraft"-Philosophie
- Verwende klare, verständliche Sprache
- Füge SEO-relevante Keywords natürlich ein
- Länge: ca. 300-500 Wörter

**Formatierung:**
- Verwende HTML-Tags für Überschriften (h2, h3)
- Strukturiere Absätze mit <p>-Tags
- Verwende <strong> für wichtige Begriffe
- Füge Listen mit <ul> und <li> hinzu, wo angemessen`,
    });
    return response.text;
  }
  catch (error) {
    console.error("Error during content generation:", error);
    throw new Error("Fehler bei der Inhaltserstellung. Bitte versuchen Sie es später erneut.");
  }
};

export const reviseContent = async (content: string, feedback: string) => {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Überarbeite den folgenden Inhalt basierend auf dem Feedback:

**Aktueller Inhalt:**
${content}

**Feedback:**
${feedback}

**Anforderungen für die Überarbeitung:**
- Berücksichtige das gesamte Feedback
- Behalte die HTML-Struktur bei
- Verbessere die Lesbarkeit und Verständlichkeit
- Stärke die "Willenskraft"-Philosophie
- Optimiere für SEO
- Halte den positiven, wissenschaftlichen Ton bei`,
    });
    return response.text;
  }
  catch (error) {
    console.error("Error during content revision:", error);
    throw new Error("Fehler bei der Überarbeitung. Bitte versuchen Sie es später erneut.");
  }
};

export const generateProductionHtml = async (finalContent: string) => {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Erstelle vollständigen, WordPress-kompatiblen HTML-Code aus dem folgenden Inhalt:

**Inhalt:**
${finalContent}

**Anforderungen an den HTML-Code:**
1.  **Keine <script>-Tags:** Nur reines HTML und CSS
2.  **Styles im Block:** Ein einziges <style>-Tag direkt im HTML
3.  **Spezifität gehärtet:** Verwende :is(.entry-content,.wp-block-post-content,.post-content,.wp-block-group,.prose,body) + sparsam !important bei Links/Buttons
4.  **Icon sicher gelöst:** Verwende <span class="paw">🐾</span> statt ::before
5.  **Full-Bleed am Desktop:** Container bricht mit width:100vw und margin-left/right: calc(50% - 50vw) aus
6.  **Lesbarkeit innen:** .willenskraft-article-inner mit max-width:1200px + Padding
7.  **Animation ohne JS:** Keyframe fadeUp + gestaffelte animation-delay für .fade-in-element-Klassen

**WordPress-kompatible Struktur:**
- Ein einziger HTML-Block für "Benutzerdefiniertes HTML"
- Robuste CSS-Selektoren gegen Theme-Kollisionen
- Volle Breite am Desktop mit Lesbarkeits-Container
- CSS-Animationen für visuelle Effekte

**Ergebnis:** 1 Block, 100% WP-kompatibel, volle Breite am Desktop, stabil gegen Theme-Kollisionen.`,
    });
    return response.text;
  }
  catch (error) {
    console.error("Error during HTML generation:", error);
    throw new Error("Fehler bei der HTML-Generierung. Bitte versuchen Sie es später erneut.");
  }
};

export const generateImageFromPrompt = async (prompt: string, referenceImage?: string) => {
  try {
    const response = await getAi().models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: referenceImage ? [
        {
          role: "user",
          parts: [
            { text: `Erstelle ein Bild im Stil des Referenzbildes mit folgendem Motiv: ${prompt}` },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: referenceImage.split(',')[1]
              }
            }
          ]
        }
      ] : [
        {
          role: "user",
          parts: [
            { text: `Erstelle ein professionelles Bild zum Thema: ${prompt}` }
          ]
        }
      ],
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

    const parseImageResponse = (response: GenerateContentResponse, imageType: string): string => {
      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error(`No content parts found in ${imageType} response`);
      }
      
      const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
      if (!imagePart?.inlineData?.data) {
        throw new Error(`No image data found in ${imageType} response`);
      }
      
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    };

    return parseImageResponse(response, referenceImage ? "reference" : "prompt");
  }
  catch (error) {
    console.error("Error during image generation:", error);
    throw new Error("Fehler bei der Bildgenerierung. Bitte versuchen Sie es später erneut.");
  }
};