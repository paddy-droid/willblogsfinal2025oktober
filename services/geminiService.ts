import { GroundingChunk } from "../types";

// API-Aufrufe über Backend-Proxy, um API-Schlüssel sicher zu halten
const API_BASE_URL = '/api';

export const conductResearch = async (topic: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { text: data.text, sources: data.sources };
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
    
    const response = await fetch(`${API_BASE_URL}/outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, research, sourceList, internalLinks }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  }
  catch (error) {
    console.error("Error during outline creation:", error);
    throw new Error("Fehler bei der Gliederungserstellung. Bitte versuchen Sie es später erneut.");
  }
};

export const generateContentPart = async (topic: string, outline: string, previousContent: string, part: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, outline, previousContent, part }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  }
  catch (error) {
    console.error("Error during content generation:", error);
    throw new Error("Fehler bei der Inhaltserstellung. Bitte versuchen Sie es später erneut.");
  }
};

export const reviseContent = async (content: string, feedback: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/revise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, feedback }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  }
  catch (error) {
    console.error("Error during content revision:", error);
    throw new Error("Fehler bei der Überarbeitung. Bitte versuchen Sie es später erneut.");
  }
};

export const generateProductionHtml = async (finalContent: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/production-html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: finalContent }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.html;
  }
  catch (error) {
    console.error("Error during HTML generation:", error);
    throw new Error("Fehler bei der HTML-Generierung. Bitte versuchen Sie es später erneut.");
  }
};

export const generateImageFromPrompt = async (prompt: string, referenceImage?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, referenceImage }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.image;
  }
  catch (error) {
    console.error("Error during image generation:", error);
    throw new Error("Fehler bei der Bildgenerierung. Bitte versuchen Sie es später erneut.");
  }
};