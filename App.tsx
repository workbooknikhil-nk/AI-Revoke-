import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageViewer from './components/ImageViewer';
import { enhancePhoto, generatePreview } from './services/geminiService';
import type { ImageFile } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contrast, setContrast] = useState<number>(50);

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
      setContrast(50);
      setIsPreview(false);
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePreview = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setIsAdjusting(false);
    setError(null);
    
    const contrastToUse = enhancedImage ? contrast : 50;
    if (!enhancedImage) {
        setContrast(50);
    }

    try {
      const base64Data = originalImage.base64.split(',')[1];
      const resultBase64 = await generatePreview(base64Data, originalImage.type, contrastToUse);
      setEnhancedImage(`data:image/png;base64,${resultBase64}`);
      setIsPreview(true);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate preview. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, enhancedImage, contrast]);
  
  const handleContrastChange = useCallback(async (newContrastValue: number) => {
    if (!originalImage) return;

    setContrast(newContrastValue);
    setIsLoading(true);
    setIsAdjusting(true);
    setError(null);

    try {
      const base64Data = originalImage.base64.split(',')[1];
      const resultBase64 = await generatePreview(base64Data, originalImage.type, newContrastValue);
      setEnhancedImage(`data:image/png;base64,${resultBase64}`);
      setIsPreview(true);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to adjust contrast. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  const handleGenerateFullQuality = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setIsAdjusting(false);
    setError(null);

    try {
      const base64Data = originalImage.base64.split(',')[1];
      const resultBase64 = await enhancePhoto(base64Data, originalImage.type, contrast);
      setEnhancedImage(`data:image/png;base64,${resultBase64}`);
      setIsPreview(false);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to enhance image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, contrast]);

  const getButton = () => {
      if (isPreview) {
          return (
             <button
              onClick={handleGenerateFullQuality}
              disabled={isLoading}
              className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
            >
              {isLoading && !isAdjusting ? 'Generating...' : 'Generate Full Quality'}
            </button>
          );
      }
      
      const buttonText = enhancedImage 
        ? 'Enhance Again' 
        : 'Enhance Photo';

      const loadingText = isAdjusting ? 'Applying...' : 'Enhancing...';

      return (
         <button
              onClick={handleGeneratePreview}
              disabled={isLoading}
              className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isLoading ? loadingText : buttonText}
            </button>
      );
  }


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
              <div className="flex flex-col gap-4">
                 <ImageViewer
                    title="Enhanced"
                    imageUrl={enhancedImage}
                    isLoading={isLoading}
                    isAdjusting={isAdjusting}
                    isEnhanced={true}
                    fileName={originalImage.name}
                    isPreview={isPreview}
                  />
                  {enhancedImage && (
                    <div className="w-full bg-gray-800 p-4 rounded-xl shadow-md">
                      <label htmlFor="contrast-slider" className="block mb-2 text-sm font-medium text-gray-400">
                        Adjust Contrast
                      </label>
                      <input
                        id="contrast-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={contrast}
                        disabled={isLoading}
                        onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                        onMouseUp={(e) => handleContrastChange(parseInt(e.currentTarget.value, 10))}
                        onTouchEnd={(e) => handleContrastChange(parseInt(e.currentTarget.value, 10))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:cursor-not-allowed"
                      />
                   </div>
                  )}
              </div>
            </div>
            {getButton()}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;