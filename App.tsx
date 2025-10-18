
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageViewer from './components/ImageViewer';
import { enhancePhoto } from './services/geminiService';
import type { ImageFile } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage({
        base64: reader.result as string,
        name: file.name,
        type: file.type,
      });
      setEnhancedImage(null);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setEnhancedImage(null);
    setError(null);

    try {
      // The base64 string from FileReader includes the data URL prefix, which needs to be removed.
      const base64Data = originalImage.base64.split(',')[1];
      const resultBase64 = await enhancePhoto(base64Data, originalImage.type);
      
      // The Gemini API returns a raw base64 string, so we need to add the data URL prefix back.
      // The model typically returns PNGs after editing.
      setEnhancedImage(`data:image/png;base64,${resultBase64}`);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to enhance image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!originalImage && <ImageUploader onImageUpload={handleImageUpload} />}

        {originalImage && (
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl mb-8">
              <ImageViewer title="Original" imageUrl={originalImage.base64} />
              <ImageViewer
                title="Enhanced"
                imageUrl={enhancedImage}
                isLoading={isLoading}
                isEnhanced={true}
                fileName={originalImage.name}
              />
            </div>

            <button
              onClick={handleEnhance}
              disabled={isLoading}
              className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isLoading ? 'Enhancing...' : 'Enhance Photo'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
