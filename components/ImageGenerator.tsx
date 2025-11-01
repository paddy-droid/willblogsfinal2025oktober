import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const imageFilters = [
    { name: 'Fotorealistisch', value: ', fotorealistisch, 8k, ultra-detailliert, professionelle Fotografie' },
    { name: 'Cinematic', value: ', cinematic look, film grain, dramatic lighting' },
    { name: 'Aquarell', value: ', im Stil eines Aquarellgemäldes, weiche Kanten, leuchtende Farben' },
    { name: 'Vintage', value: ', im Stil eines Vintage-Fotos, sepia Tönung, leicht unscharf' },
    { name: 'Neon-Punk', value: ', cyberpunk stil, neonlichter, futuristisch' },
    { name: 'Minimalistisch', value: ', minimalistisch, klarlinige Kunst, einfacher Hintergrund' },
    { name: 'Fantasy', value: ', fantasy-kunst, episch, mythisch, leuchtende Details' },
    { name: 'Pop Art', value: ', Pop-Art-Stil, kräftige Farben, Comic-Look' },
    { name: 'Isometrisch', value: ', isometrische 3D-Illustration, clean, Vektorgrafik' },
    { name: 'Abstrakt', value: ', abstrakte Kunst, geometrische Formen, kühne Muster' },
    { name: 'Paddyfilter', value: ', hochwertige, minimalistische Bleistiftzeichnung, klare Linien, wenige Motive, mit subtilen Pop-Art-Effekten im Hintergrund' },
];


const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [referenceImage, setReferenceImage] = useState<{data: string, mimeType: string} | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setReferenceImage({ data: base64String, mimeType: file.type });
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!prompt.trim()) {
            setError("Bitte geben Sie einen Prompt für das Bild ein.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const imageBase64 = await geminiService.generateImageFromPrompt(prompt, referenceImage || undefined);
            setGeneratedImage(imageBase64);
        } catch (e: any) {
            setError(e.message || "Fehler bei der Bilderstellung.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${generatedImage}`;
        link.download = `${prompt.slice(0, 20).replace(/\s/g, '_') || 'generated_image'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const applyFilter = (filterValue: string) => {
        setPrompt(prev => prev.endsWith(filterValue) ? prev : prev + filterValue);
    }

    return (
        <div className="w-full max-w-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Willenskraft Image Generator</h2>
            <p className="text-gray-600 mb-6 text-center">Beschreibe dein Wunschbild, lade optional ein Referenzbild hoch und wähle einen Stil.</p>
            
            <div className="w-full bg-white p-6 rounded-lg border border-gray-200">
                <div className="mb-4">
                    <label htmlFor="reference-image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                      Referenzbild (Optional)
                    </label>
                    <div className="flex items-center space-x-4">
                        <input
                            id="reference-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                        />
                        {imagePreview && <img src={imagePreview} alt="Vorschau" className="h-16 w-16 object-cover rounded-md border border-gray-300"/>}
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Bildbeschreibung (Prompt)
                    </label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="z.B. 'Ein glücklicher Hund, der auf einer sonnigen Wiese rennt'"
                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        rows={3}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stil-Filter
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {imageFilters.map(filter => (
                            <button key={filter.name} onClick={() => applyFilter(filter.value)} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 border border-gray-300 transition-colors">
                                {filter.name}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerateImage}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex justify-center items-center"
                >
                    {isLoading ? <LoadingSpinner /> : 'Bild generieren'}
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md my-4 w-full">{error}</div>}

            {generatedImage && (
                <div className="mt-8 w-full">
                     <h3 className="text-xl font-bold text-orange-600 mb-4 text-center">Generiertes Bild</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
                        <img 
                            src={`data:image/png;base64,${generatedImage}`} 
                            alt={prompt}
                            className="rounded-md w-full"
                        />
                        <button
                            onClick={handleDownload}
                            className="w-full mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-sm text-white font-bold rounded-md transition-colors flex items-center justify-center"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Herunterladen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;