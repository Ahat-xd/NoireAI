import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImagePreviewModalProps {
  image: UploadedImage | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image.previewUrl;
    a.download = image.name || 'image.png';
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            id="download-preview-btn"
            onClick={handleDownload}
            className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white text-sm transition-colors cursor-pointer"
            title="Скачать фото"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            id="close-preview-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white text-sm transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <img
          src={image.previewUrl}
          alt={image.name || 'Просмотр изображения'}
          className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl bg-slate-950"
        />

        {image.name && (
          <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/90 text-slate-300 text-xs font-mono">
            {image.name} {image.size ? `(${Math.round(image.size / 1024)} КБ)` : ''}
          </div>
        )}
      </div>
    </div>
  );
};
