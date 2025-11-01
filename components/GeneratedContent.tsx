import React, { useState } from 'react';
import { GroundingChunk } from '../types';

interface GeneratedContentProps {
  title: string;
  content: string;
  sources?: GroundingChunk[];
  isCodeBlock?: boolean;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ title, content, sources, isCodeBlock = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = isCodeBlock ? content : (() => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        return tempDiv.textContent || tempDiv.innerText || "";
    })();
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const buttonText = isCodeBlock ? 'Code kopieren' : 'Text kopieren';
  const copyIcon = isCodeBlock ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 my-4 w-full relative shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{color: '#E58E1A'}}>{title}</h2>
        <button
            onClick={handleCopy}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors flex items-center border border-gray-300"
        >
            {copied ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kopiert!
                </>
            ) : (
                <>
                    {copyIcon}
                    {buttonText}
                </>
            )}
        </button>
      </div>

      {isCodeBlock ? (
        <pre><code>{content}</code></pre>
      ) : (
        <div 
            className="generated-html-content text-gray-700"
            dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {sources && sources.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold mb-2" style={{color: '#E58E1A'}}>Quellen</h3>
          <ul className="list-disc list-inside space-y-2">
            {sources.map((source, index) =>
              source.web ? (
                <li key={index}>
                  <a
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80"
                    style={{color: '#E58E1A'}}
                  >
                    {source.web.title || source.web.uri}
                  </a>
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GeneratedContent;