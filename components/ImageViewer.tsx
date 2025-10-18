import React from 'react';
import Spinner from './Spinner';

interface ImageViewerProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  isEnhanced?: boolean;
  fileName?: string;
  isAdjusting?: boolean;
  isPreview?: boolean;
}

const DownloadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ImageIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);


const ImageViewer: React.FC<ImageViewerProps> = ({ title, imageUrl, isLoading = false, isEnhanced = false, fileName, isAdjusting = false, isPreview = false }) => {
    
  const handleDownload = () => {
    if (!imageUrl || !fileName) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    
    const nameParts = fileName.split('.');
    nameParts.pop(); // Remove original extension
    const name = nameParts.join('.');
    
    link.download = `${name}-enhanced.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-400 tracking-wider">{title}</h2>
      <div className="w-full aspect-square bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden">
        {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Spinner />
                <p className="text-lg text-gray-300 mt-4">{isAdjusting ? 'Applying adjustments...' : 'AI is working its magic...'}</p>
            </div>
        )}
        
        {isPreview && imageUrl && !isLoading && (
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold py-1 px-3 rounded-full z-10 tracking-wider">
                PREVIEW
            </div>
        )}

        {!isLoading && !imageUrl && (
             <div className="text-gray-600 text-center">
                 <ImageIcon className="w-24 h-24 mx-auto"/>
                 <p className="mt-2">{isEnhanced ? 'Your enhanced photo will appear here' : 'Your photo will appear here'}</p>
             </div>
        )}
        
        {imageUrl && <img src={imageUrl} alt={title} className="object-contain w-full h-full" />}

        {isEnhanced && imageUrl && !isLoading && !isPreview && (
             <button 
                onClick={handleDownload}
                className="absolute bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-500 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50">
                <DownloadIcon className="w-6 h-6" />
                <span className="sr-only">Download Enhanced Image</span>
             </button>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;