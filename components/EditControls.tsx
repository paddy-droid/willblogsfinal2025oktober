import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface EditControlsProps {
  isEditing: boolean;
  onToggleEditing: () => void;
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onRequestChanges: () => void;
  isRevising: boolean;
}

const EditControls: React.FC<EditControlsProps> = ({
  isEditing,
  onToggleEditing,
  feedback,
  onFeedbackChange,
  onRequestChanges,
  isRevising,
}) => {
  if (isEditing) {
    return (
      <div className="w-full max-w-4xl bg-white border border-orange-500/50 rounded-lg p-4 mt-4 shadow-lg">
        <h3 className="text-lg font-semibold text-orange-600 mb-2">Inhalt anpassen</h3>
        <p className="text-sm text-gray-600 mb-4">
          Beschreiben Sie hier Ihre Änderungswünsche (z.B. "Füge einen Abschnitt über Welpentraining hinzu" oder "Formuliere den zweiten Absatz um, damit er positiver klingt").
        </p>
        <textarea
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Ihre Anweisungen..."
          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
          rows={4}
        />
        <div className="flex items-center justify-end mt-4 space-x-4">
          <button
            onClick={onToggleEditing}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 rounded-md transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onRequestChanges}
            disabled={isRevising || !feedback.trim()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-sm text-white font-bold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isRevising ? <><LoadingSpinner /> Überarbeite...</> : 'Änderungen anfordern'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onToggleEditing}
      className="px-6 py-2 border-2 border-orange-500 text-orange-600 font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300"
    >
      Anpassen
    </button>
  );
};

export default EditControls;