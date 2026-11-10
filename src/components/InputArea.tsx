import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  FileSearch,
} from 'lucide-react';
import { AnalysisLevel, SAMPLE_PAPERS, SamplePaper } from '../types/paper';
import { LevelSelector } from './LevelSelector';

interface InputAreaProps {
  onAnalyze: (payload: { text?: string; pdfBase64?: string; level: AnalysisLevel; sourceName: string }) => void;
  isLoading: boolean;
  loadingStatusMessage: string;
  errorMessage: string | null;
  onClearError: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onAnalyze,
  isLoading,
  loadingStatusMessage,
  errorMessage,
  onClearError,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [textInput, setTextInput] = useState('');
  const [level, setLevel] = useState<AnalysisLevel>('Beginner');

  // PDF state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    setFileError(null);
    onClearError();

    if (!file) {
      setSelectedFile(null);
      setPdfBase64(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Please select a valid PDF file (.pdf).');
      return;
    }

    // Max 25 MB
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('The PDF is too large (max 25MB). Please upload a smaller file or copy the text.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPdfBase64(result);
    };
    reader.onerror = () => {
      setFileError('Could not read the PDF file. It might be corrupted or protected.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPdfBase64(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSample = (sample: SamplePaper) => {
    setActiveTab('text');
    setTextInput(sample.abstract);
    setLevel(sample.level);
    onClearError();
    removeFile();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();

    if (activeTab === 'pdf') {
      if (!pdfBase64 || !selectedFile) {
        setFileError('Please select a PDF file before analyzing.');
        return;
      }
      onAnalyze({
        pdfBase64,
        level,
        sourceName: selectedFile.name,
      });
    } else {
      if (!textInput.trim()) {
        setFileError('Please paste a paper abstract or section text before analyzing.');
        return;
      }
      if (textInput.trim().length < 40) {
        setFileError('The text is too brief to analyze. Please paste a full abstract or paragraph (at least 40 characters).');
        return;
      }
      onAnalyze({
        text: textInput.trim(),
        level,
        sourceName: 'Pasted Text/Abstract',
      });
    }
  };

  const activeError = errorMessage || fileError;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pdf');
              setFileError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'pdf'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Upload PDF Paper</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              setFileError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'text'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Paste Text or Abstract</span>
          </button>
        </div>

        {/* Quick clear button */}
        {(textInput || selectedFile) && (
          <button
            type="button"
            onClick={() => {
              setTextInput('');
              removeFile();
              onClearError();
            }}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1 rounded-md transition-colors"
          >
            Clear Input
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
        {/* Input Body */}
        {activeTab === 'text' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="paper-text" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Paper Abstract or Section Text
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('pdf')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Attach PDF file instead</span>
                </button>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-400">{textInput.length} chars</span>
              </div>
            </div>
            <textarea
              id="paper-text"
              rows={6}
              disabled={isLoading}
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                if (fileError) setFileError(null);
                if (errorMessage) onClearError();
              }}
              placeholder="Paste the abstract, introduction, or methodology section of any research paper here..."
              className="w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all font-sans leading-relaxed resize-y min-h-[140px]"
            />

            {/* Quick Sample Papers */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <FileSearch className="w-3.5 h-3.5" />
                Try sample:
              </span>
              {SAMPLE_PAPERS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors border border-slate-200/60"
                  title={`${sample.tag} • Level: ${sample.level}`}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Upload Research Paper (PDF)
            </label>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70 bg-slate-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to select or drag and drop your paper PDF
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Full academic papers, preprints (arXiv, bioRxiv), or journal articles (up to 25MB)
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                  title="Remove PDF"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Level Selector */}
        <div className="pt-2">
          <LevelSelector
            selectedLevel={level}
            onChange={setLevel}
            disabled={isLoading}
          />
        </div>

        {/* Error Message Banner */}
        {activeError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block text-rose-900">Analysis Notice</strong>
              <span>{activeError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFileError(null);
                onClearError();
              }}
              className="text-rose-400 hover:text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-indigo-400 text-white cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-100" />
                <span>{loadingStatusMessage || 'Analyzing Paper...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Analyze Paper</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
