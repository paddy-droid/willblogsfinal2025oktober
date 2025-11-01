import React, { useState, useMemo, useEffect } from 'react';
import { Step, GroundingChunk } from './types';
import * as geminiService from './services/geminiService';
import StepIndicator from './components/StepIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import GeneratedContent from './components/GeneratedContent';
import EditControls from './components/EditControls';
import ImageGenerator from './components/ImageGenerator';

const INTERNAL_LINKS = [
    'https://www.willenskraft.co.at/',
    'https://www.willenskraft.co.at/hundetrainer-ausbildung/',
    'https://www.willenskraft.co.at/online-hundeschule/',
    'https://www.willenskraft.co.at/angebot-nach-regionen/',
    'https://www.willenskraft.co.at/blog-hunde-steiermark/',
    'https://www.willenskraft.co.at/graz-und-umgebung-martha-hoehr/',
    'https://www.willenskraft.co.at/kontakt-hundeschule/',
    'https://www.willenskraft.co.at/e-books-affirmationen-hund/',
    'https://www.willenskraft.co.at/hundeschule-bruck-leitha/',
];

const getStepKey = (step: Step): string => {
    switch (step) {
        case Step.RESEARCH: return 'research';
        case Step.OUTLINE: return 'outline';
        case Step.CONTENT_PART_1: return 'part1';
        case Step.CONTENT_PART_2: return 'part2';
        case Step.CONTENT_PART_3: return 'part3';
        default: return '';
    }
}

type ActiveTool = 'blog' | 'image';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.TOPIC_INPUT);
  const [activeTool, setActiveTool] = useState<ActiveTool>('blog');
  const [topic, setTopic] = useState<string>('');
  
  // State for final, accepted content of each step
  const [stepData, setStepData] = useState<Record<string, string>>({});
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  
  // State for content currently being reviewed/edited
  const [currentOutput, setCurrentOutput] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFeedback, setEditFeedback] = useState<string>('');

  const [productionHtml, setProductionHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInitialContent = async (step: Step, currentTopic: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentOutput('');

    try {
      let result;
      if (step === Step.RESEARCH) {
        const { text, sources: newSources } = await geminiService.conductResearch(currentTopic);
        setSources(newSources);
        result = text;
      } else if (step === Step.OUTLINE) {
        result = await geminiService.createOutline(currentTopic, stepData.research, sources, INTERNAL_LINKS);
      } else if (step === Step.CONTENT_PART_1) {
        result = await geminiService.generateContentPart(currentTopic, stepData.outline, '', 1);
      } else if (step === Step.CONTENT_PART_2) {
        result = await geminiService.generateContentPart(currentTopic, stepData.outline, stepData.part1, 2);
      } else if (step === Step.CONTENT_PART_3) {
        const previousContent = `${stepData.part1}${stepData.part2}`;
        result = await geminiService.generateContentPart(currentTopic, stepData.outline, previousContent, 3);
      }
      setCurrentOutput(result || '');
    } catch (e: any) {
      setError(e.message || 'Ein unbekannter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestChanges = async () => {
    if (!editFeedback.trim()) {
        setError("Bitte geben Sie Ihr Feedback für die Überarbeitung ein.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        const revisedContent = await geminiService.reviseContent(currentOutput, editFeedback);
        setCurrentOutput(revisedContent);
        setIsEditing(false);
        setEditFeedback('');
    } catch (e: any) {
        setError(e.message || "Fehler bei der Überarbeitung.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAcceptAndProceed = () => {
    const stepKey = getStepKey(currentStep);
    if (!stepKey) return;
    
    const nextStep = currentStep + 1;
    
    setStepData(prev => ({ ...prev, [stepKey]: currentOutput }));
    setCurrentStep(nextStep);
    setCurrentOutput('');
    setIsEditing(false);

    if (nextStep < Step.COMPLETED) {
      handleGenerateInitialContent(nextStep, topic);
    }
  };
  
  const startProcess = () => {
    setCurrentStep(Step.RESEARCH);
    handleGenerateInitialContent(Step.RESEARCH, topic);
  };

  const finalArticle = useMemo(() => {
    if (currentStep !== Step.COMPLETED) return '';
    const { outline, part1, part2, part3 } = stepData;
    if (!outline || !part1 || !part2 || !part3) return '';
    
    return `${part1}${part2}${part3}`;
  }, [currentStep, stepData]);
  
  useEffect(() => {
    if (currentStep === Step.COMPLETED && finalArticle && !productionHtml && !isLoading) {
        const generateFinalCode = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const finalHtml = await geminiService.generateProductionHtml(finalArticle);
                setProductionHtml(finalHtml);
            } catch (e: any) {
                setError(`Der finale Blogartikel konnte nicht generiert werden: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        generateFinalCode();
    }
  }, [currentStep, finalArticle, productionHtml, isLoading]);
  
  const handleReset = () => {
    setCurrentStep(Step.TOPIC_INPUT);
    setTopic('');
    setStepData({});
    setSources([]);
    setCurrentOutput('');
    setProductionHtml('');
    setError(null);
    setIsEditing(false);
    setEditFeedback('');
    setActiveTool('blog');
  };

  const stepTitles: Record<string, string> = {
    research: "Schritt 1: Web Recherche",
    outline: "Schritt 2: Gliederung & SEO",
    part1: "Schritt 3: Artikel Teil 1 (Einleitung)",
    part2: "Schritt 4: Artikel Teil 2 (Hauptteil)",
    part3: "Schritt 5: Artikel Teil 3 (Fazit)",
  };
  
  const renderContent = () => {
    if (currentStep === Step.TOPIC_INPUT) {
        return (
            <div className="w-full max-w-4xl text-center bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Wählen Sie Ihr Content-Tool:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => setActiveTool('blog')}
                            className={`p-6 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                                activeTool === 'blog'
                                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                            }`}
                        >
                            <div className="text-4xl mb-3">📝</div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Blog Generator</h3>
                            <p className="text-gray-600 text-sm">Erstelle vollständige Blogartikel mit KI-Unterstützung</p>
                            {activeTool === 'blog' && (
                                <div className="mt-3 text-orange-500 font-semibold">
                                    ✓ Ausgewählt
                                </div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTool('image')}
                            className={`p-6 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                                activeTool === 'image'
                                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                            }`}
                        >
                            <div className="text-4xl mb-3">🖼️</div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Image Generator</h3>
                            <p className="text-gray-600 text-sm">Erstelle ansprechende Bilder für deine Inhalte</p>
                            {activeTool === 'image' && (
                                <div className="mt-3 text-orange-500 font-semibold">
                                    ✓ Ausgewählt
                                </div>
                            )}
                        </button>
                    </div>
                </div>
              
              {activeTool === 'blog' ? (
                <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">Worum soll es im Blogartikel gehen?</h3>
                  <p className="text-gray-600 mb-4">Gib ein Thema ein und die KI führt dich durch den bewährten Willenskraft-Prozess zur Erstellung hochwertiger Inhalte.</p>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="z.B. 'Die Körpersprache des Hundes richtig deuten'"
                    className="w-full p-3 bg-white border border-gray-300 rounded-md focus:ring-2 focus:outline-none"
                    style={{'--tw-ring-color': '#E58E1A'} as React.CSSProperties}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <ImageGenerator />
                </div>
              )}
            </div>
        );
    }

    if (isLoading && !currentOutput) {
        return <div className="my-8"><LoadingSpinner /></div>;
    }
    
    if (currentStep === Step.COMPLETED) {
        return (
            <>
              <GeneratedContent title="Fertiger Blogartikel (Vorschau)" content={finalArticle} />
              {isLoading && !productionHtml && (
                <div className="my-4 w-full flex flex-col items-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-gray-600">Generiere finalen HTML-Code für WordPress...</p>
                </div>
              )}
              {productionHtml && (
                <GeneratedContent 
                    title="Vollständiger HTML-Code für WordPress" 
                    content={productionHtml}
                    isCodeBlock={true}
                />
              )}
            </>
        );
    }

    if (currentOutput) {
        const stepKey = getStepKey(currentStep);
        return (
            <>
                <GeneratedContent 
                    title={stepTitles[stepKey] || "Aktueller Schritt"} 
                    content={currentOutput} 
                    sources={currentStep === Step.RESEARCH ? sources : undefined} 
                />
                <EditControls
                    isEditing={isEditing}
                    onToggleEditing={() => setIsEditing(!isEditing)}
                    feedback={editFeedback}
                    onFeedbackChange={setEditFeedback}
                    onRequestChanges={handleRequestChanges}
                    isRevising={isLoading}
                />
            </>
        );
    }
    
    return null;
  };
  
  const renderButtons = () => {
    if (isLoading || isEditing) return null;

    if (currentStep === Step.TOPIC_INPUT && activeTool === 'blog') {
      return (
        <button
          onClick={startProcess}
          disabled={!topic.trim()}
          className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          Recherche starten
        </button>
      );
    }
    
    if (currentStep === Step.COMPLETED) {
       return (
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
        >
          Neuen Artikel starten
        </button>
      );
    }
    
    if (currentOutput && currentStep > Step.TOPIC_INPUT && currentStep < Step.COMPLETED) {
        return (
             <button
                onClick={handleAcceptAndProceed}
                className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            >
                Akzeptieren & Weiter
            </button>
        )
    }

    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-orange-500" style={{color: '#E58E1A'}} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5a.75.75 0 01.75.75V8h3.75a.75.75 0 010 1.5H10.75V14h-1.5V9.5H5.5a.75.75 0 010-1.5H9.25V4.25A.75.75 0 0110 3.5z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M8.47 2.47a.75.75 0 011.06 0l5.5 5.5a.75.75 0 01-1.06 1.06L10 5.06l-3.97 3.97a.75.75 0 01-1.06-1.06l4.5-4.5zM15.28 9.22a.75.75 0 01-1.06 0L10.25 5.25V10h4.75a.75.75 0 010 1.5H10.25v4.56l3.97-3.97a.75.75 0 011.06 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-5.5-5.5a.75.75 0 111.06-1.06L9.75 16.94V11.5H5a.75.75 0 010-1.5h4.75V5.25L5.78 9.22a.75.75 0 01-1.06-1.06l5.5-5.5a.75.75 0 011.06 0l5.5 5.5a.75.75 0 010 1.06z" clipRule="evenodd" />
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-7a7 7 0 100 14 7 7 0 000-14z" />
                 </svg>
                 Willenskraft Content Cockpit
                </h1>
                 <p className="text-gray-600 mt-2">
                    Für Bianca: Hochwertige Blog- und Bildinhalte im Handumdrehen erstellen.
                </p>
            </header>

            {currentStep > Step.TOPIC_INPUT && (
                <div className="w-full mb-8">
                    <StepIndicator currentStep={currentStep} />
                </div>
            )}


            <main className="w-full max-w-4xl flex flex-col items-center">
                {renderContent()}
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md my-4 w-full max-w-2xl">{error}</div>}

                <div className="mt-6 flex items-center space-x-4">
                  {renderButtons()}
                </div>
            </main>
        </div>
    </div>
  );
};

export default App;