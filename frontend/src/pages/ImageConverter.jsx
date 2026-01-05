import { useState } from "react";
import { toast } from 'sonner';

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [isConverting, setIsConverting] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [activeTab, setActiveTab] = useState("convert"); // "convert" or "remove-bg"

  const supportedFormats = [
    { value: "jpeg", label: "JPEG", extension: ".jpg" },
    { value: "png", label: "PNG", extension: ".png" },
    { value: "webp", label: "WebP", extension: ".webp" },
    { value: "bmp", label: "BMP", extension: ".bmp" },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB!");
      return;
    }

    setSelectedFile(file);
    setConvertedImage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    toast.success("Image loaded successfully!");
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first!");
      return;
    }

    setIsConverting(true);

    try {
      const img = new Image();
      img.src = previewUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        let mimeType = `image/${outputFormat}`;
        
        if (outputFormat === "jpeg" || outputFormat === "jpg") {
          mimeType = "image/jpeg";
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              toast.error("Conversion failed!");
              setIsConverting(false);
              return;
            }

            const url = URL.createObjectURL(blob);
            setConvertedImage({
              url,
              blob,
              size: blob.size,
              format: outputFormat,
              type: "converted"
            });

            setIsConverting(false);
            toast.success(`Converted to ${outputFormat.toUpperCase()} successfully!`);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        toast.error("Failed to load image!");
        setIsConverting(false);
      };
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Conversion failed!");
      setIsConverting(false);
    }
  };

  const handleRemoveBackground = async () => {
  if (!selectedFile) {
    toast.error("Please select an image first!");
    return;
  }

  setIsRemovingBg(true);
  toast.info("Processing... This may take a few seconds");

  try {
    const img = new Image();
    img.src = previewUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Advanced Background Detection Algorithm
      
      // Step 1: Sample corners to detect background color
      const cornerSamples = [];
      const sampleSize = 20; // Sample 20x20 pixels from each corner
      
      // Top-left corner
      for (let y = 0; y < sampleSize && y < canvas.height; y++) {
        for (let x = 0; x < sampleSize && x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          cornerSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
      }
      
      // Top-right corner
      for (let y = 0; y < sampleSize && y < canvas.height; y++) {
        for (let x = canvas.width - sampleSize; x < canvas.width && x >= 0; x++) {
          const i = (y * canvas.width + x) * 4;
          cornerSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
      }
      
      // Bottom-left corner
      for (let y = canvas.height - sampleSize; y < canvas.height && y >= 0; y++) {
        for (let x = 0; x < sampleSize && x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          cornerSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
      }
      
      // Bottom-right corner
      for (let y = canvas.height - sampleSize; y < canvas.height && y >= 0; y++) {
        for (let x = canvas.width - sampleSize; x < canvas.width && x >= 0; x++) {
          const i = (y * canvas.width + x) * 4;
          cornerSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
      }

      // Step 2: Calculate average background color
      const avgBgColor = {
        r: cornerSamples.reduce((sum, c) => sum + c.r, 0) / cornerSamples.length,
        g: cornerSamples.reduce((sum, c) => sum + c.g, 0) / cornerSamples.length,
        b: cornerSamples.reduce((sum, c) => sum + c.b, 0) / cornerSamples.length
      };

      console.log('Detected background color:', avgBgColor);

      // Step 3: Remove background with adaptive threshold
      const colorThreshold = 40; // How close to bg color (lower = stricter)
      const edgePreservation = 15; // Preserve edges better
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate color difference from background
        const rDiff = Math.abs(r - avgBgColor.r);
        const gDiff = Math.abs(g - avgBgColor.g);
        const bDiff = Math.abs(b - avgBgColor.b);
        const totalDiff = rDiff + gDiff + bDiff;
        
        // Check if pixel is similar to background
        if (totalDiff < colorThreshold) {
          // Fully transparent
          data[i + 3] = 0;
        } else if (totalDiff < colorThreshold + edgePreservation) {
          // Semi-transparent for smooth edges
          const alpha = ((totalDiff - colorThreshold) / edgePreservation) * 255;
          data[i + 3] = Math.min(255, alpha);
        }
        // else: keep original alpha (opaque)
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("Background removal failed!");
            setIsRemovingBg(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          setConvertedImage({
            url,
            blob,
            size: blob.size,
            format: "png",
            type: "background-removed"
          });

          setIsRemovingBg(false);
          toast.success("Background removed successfully!");
        },
        "image/png"
      );
    };

    img.onerror = () => {
      toast.error("Failed to load image!");
      setIsRemovingBg(false);
    };
  } catch (error) {
    console.error("Background removal error:", error);
    toast.error("Background removal failed!");
    setIsRemovingBg(false);
  }
};

  const handleDownload = () => {
    if (!convertedImage) return;

    const link = document.createElement("a");
    link.href = convertedImage.url;
    
    const originalName = selectedFile.name.split(".")[0];
    const extension = convertedImage.type === "background-removed" 
      ? ".png" 
      : supportedFormats.find(f => f.value === outputFormat)?.extension || ".jpg";
    const suffix = convertedImage.type === "background-removed" ? "_no_bg" : "_converted";
    link.download = `${originalName}${suffix}${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Image downloaded!");
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedImage(null);
    setOutputFormat("jpeg");
    setQuality(0.9);
    setActiveTab("convert");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-10 via-indigo-50 to-purple-50 mb-20">
      {/* Modern Hero Section */}
      <div className="relative py-20 px-6 text-center overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-700">Free Image Tools</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
            Image Converter
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              & Editor
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Convert images to different formats or remove backgrounds instantly. 
            All processing happens in your browser - 100% private and secure.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-blue-50">
            <div className="flex">
              <button
                onClick={() => setActiveTab("convert")}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === "convert"
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Convert Format</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("remove-bg")}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === "remove-bg"
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>Remove Background</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* File Upload Section */}
            <div className="mb-8">
              <label className="block">
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload Image</span>
                  </div>
                </div>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-3 file:px-6
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600
                      file:text-white
                      hover:file:from-blue-700 hover:file:to-indigo-700
                      file:cursor-pointer cursor-pointer
                      file:transition-all file:shadow-lg
                      border-2 border-dashed border-gray-300 rounded-2xl p-8
                      hover:border-blue-400 transition-all
                      bg-gradient-to-br from-gray-50 to-blue-50/30
                      group-hover:from-blue-50/50 group-hover:to-indigo-50/30"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Supported: JPG, PNG, WebP, BMP | Max: 10MB
                </p>
              </label>
            </div>

            {/* Preview & Options */}
            {previewUrl && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Original Image Preview */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">Original Image</h3>
                  </div>
                  <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-gray-100/50">
                    <div className="bg-white rounded-xl p-2 mb-4 shadow-sm">
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="font-medium">Name:</span>
                        <span className="text-gray-900 truncate ml-2">{selectedFile.name}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="font-medium">Size:</span>
                        <span className="text-gray-900">{formatFileSize(selectedFile.size)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <span className="font-medium">Type:</span>
                        <span className="text-gray-900">{selectedFile.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options Panel */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">
                      {activeTab === "convert" ? "Conversion Options" : "Background Removal"}
                    </h3>
                  </div>

                  {activeTab === "convert" ? (
                    <>
                      {/* Output Format */}
                      <div className="mb-6">
                        <label className="block mb-3 text-sm font-semibold text-gray-700">
                          Output Format
                        </label>
                        <select
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium"
                        >
                          {supportedFormats.map((format) => (
                            <option key={format.value} value={format.value}>
                              {format.label} ({format.extension})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quality Slider */}
                      {(outputFormat === "jpeg" || outputFormat === "webp") && (
                        <div className="mb-6">
                          <label className="block mb-3 text-sm font-semibold text-gray-700">
                            Quality: {Math.round(quality * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={quality}
                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Lower size</span>
                            <span>Higher quality</span>
                          </div>
                        </div>
                      )}

                      {/* Convert Button */}
                      <button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                      >
                        {isConverting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Converting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Convert Image
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Background Remove Info */}
                      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-sm text-gray-700">
                            <p className="font-semibold mb-1">How it works:</p>
                            <p>This tool automatically detects and removes light/white backgrounds from your image. Works best with images that have solid, light-colored backgrounds.</p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Background Button */}
                      <button
                        onClick={handleRemoveBackground}
                        disabled={isRemovingBg}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                      >
                        {isRemovingBg ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Removing Background...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            Remove Background
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {/* Result Preview */}
                  {convertedImage && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-bold text-green-800">
                          {convertedImage.type === "background-removed" ? "Background Removed!" : "Conversion Successful!"}
                        </h4>
                      </div>
                      
                      <div className="bg-white rounded-xl p-2 mb-4 shadow-sm">
                        <img
                          src={convertedImage.url}
                          alt="Result"
                          className="w-full h-auto rounded-lg"
                          style={convertedImage.type === "background-removed" ? {
                            backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #f3f4f6 0% 50%)',
                            backgroundPosition: '0 0, 10px 10px',
                            backgroundSize: '20px 20px'
                          } : {}}
                        />
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="font-medium text-gray-700">Format:</span>
                          <span className="text-gray-900 font-semibold">{convertedImage.format.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="font-medium text-gray-700">Size:</span>
                          <span className="text-gray-900 font-semibold">{formatFileSize(convertedImage.size)}</span>
                        </div>
                        <div className={`flex items-center justify-between p-2 bg-white rounded-lg font-semibold ${
                          convertedImage.size < selectedFile.size ? "text-green-600" : "text-orange-600"
                        }`}>
                          <span>Size Change:</span>
                          <span>
                            {convertedImage.size < selectedFile.size ? "↓" : "↑"}{" "}
                            {((convertedImage.size / selectedFile.size) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reset Button */}
            {previewUrl && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Process Another Image
                </button>
              </div>
            )}

            {/* Empty State */}
            {!previewUrl && (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Image Selected
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Upload an image to get started. Convert formats or remove backgrounds instantly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600">
              Instant conversion in your browser. No waiting, no uploading.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">100% Private</h3>
            <p className="text-sm text-gray-600">
              All processing happens locally. Your images never leave your device.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Background Removal</h3>
            <p className="text-sm text-gray-600">
              Remove backgrounds from images automatically with one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}