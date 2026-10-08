import { useState, useRef, useEffect } from 'react';
import { MapPin, Map, Camera, Upload, Mic, Check, AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SubmitComplaint = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const [location, setLocation] = useState<{latitude: number, longitude: number, address: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [aiData, setAiData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = (file?: File) => {
    if (!file) return;
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    
    // Convert to Base64 for the backend
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setShowCamera(true);
      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions or use Upload Image.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        setImageUrl(dataUrl);
      }
      stopCamera();
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev + finalTranscript);
        }
      };
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'GPS Location Captured'
          });
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Please enable location permissions in your browser.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (title && description) {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:8000/api/v1/complaints/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title,
            description: description,
            location: location || { latitude: 21.25, longitude: 81.62, address: 'Chhattisgarh' },
            ...(imageUrl && { image_url: imageUrl })
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          alert(`Failed to submit complaint: ${errData.detail || 'Unknown error'}`);
          return;
        }

        const data = await response.json();
        setAiData(data.ai_analysis);
        setShowAnalysis(true);
      } catch (err) {
        console.error("Failed to submit complaint", err);
        alert("An error occurred while submitting the complaint.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex justify-center py-6 lg:py-12 px-4">
      <div className="w-full max-w-2xl bg-surface shadow-sm border border-borderLight rounded-2xl p-6 lg:p-10">
        
        <div className="text-center mb-8 border-b border-borderLight pb-6">
          <h1 className="text-3xl font-bold text-textPrimary tracking-wide">FILE A COMPLAINT</h1>
        </div>

        <div className="space-y-6">
          {/* Complaint Title */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Complaint Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water pipeline leakage"
              className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3 px-4 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Describe Complaint */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Describe your complaint</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details or use Voice Complaint below..."
              rows={4}
              className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3 px-4 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-textSecondary mb-3">
              <MapPin className="w-4 h-4 text-primary" /> Location
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={handleGetLocation}
                className={`border rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${location ? 'bg-primary/20 border-primary text-primary' : 'bg-surfaceLight hover:bg-surfaceLight shadow-sm border-borderLight text-textPrimary'}`}
              >
                <MapPin className="w-4 h-4" /> {location ? 'Location Captured ✓' : 'Use Current Location'}
              </button>
              <button type="button" className="bg-surfaceLight hover:bg-surfaceLight shadow-sm border border-borderLight rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-textPrimary transition-colors">
                <Map className="w-4 h-4 text-textSecondary" /> Select on Map
              </button>
            </div>
            {location && (
              <p className="mt-2 text-xs text-primary">GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
            )}
          </div>

          {/* Evidence */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-textSecondary mb-3">
              <Camera className="w-4 h-4 text-primary" /> Evidence
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={startCamera}
                className="bg-surfaceLight hover:bg-surfaceLight shadow-sm border border-borderLight rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-textPrimary transition-colors"
              >
                <Camera className="w-4 h-4 text-textSecondary" /> Take Photo
              </button>
              
              <input 
                type="file" 
                accept="image/*" 
                id="uploadInput" 
                className="hidden" 
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
              <button 
                type="button" 
                onClick={() => document.getElementById('uploadInput')?.click()}
                className="bg-surfaceLight hover:bg-surfaceLight shadow-sm border border-borderLight rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium text-textPrimary transition-colors"
              >
                <Upload className="w-4 h-4 text-textSecondary" /> Upload Image
              </button>
            </div>
            
            {showCamera && (
              <div className="mt-4 rounded-xl overflow-hidden border border-borderLight bg-black relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full max-h-64 object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button 
                    type="button" 
                    onClick={capturePhoto} 
                    className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-black"></div>
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={stopCamera}
                  className="absolute top-2 right-2 bg-black/50 text-textPrimary rounded-full p-2 hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {imagePreview && !showCamera && (
              <div className="mt-4 relative inline-block">
                <img src={imagePreview} alt="Evidence Preview" className="max-h-64 rounded-lg border border-borderLight" />
                <button 
                  type="button"
                  onClick={() => { setImagePreview(''); setImageUrl(''); }}
                  className="absolute -top-2 -right-2 bg-danger text-textPrimary rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Voice Complaint */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-textSecondary mb-3">
              <Mic className="w-4 h-4 text-primary" /> Voice Complaint (Speech to Text)
            </label>
            <button 
              type="button"
              onMouseDown={(e) => { if(!isRecording) { setIsRecording(true); try { recognitionRef.current?.start(); } catch(err){} } }}
              onMouseUp={(e) => { if(isRecording) { setIsRecording(false); try { recognitionRef.current?.stop(); } catch(err){} } }}
              onTouchStart={(e) => { if(!isRecording) { setIsRecording(true); try { recognitionRef.current?.start(); } catch(err){} } }}
              onTouchEnd={(e) => { if(isRecording) { setIsRecording(false); try { recognitionRef.current?.stop(); } catch(err){} } }}
              onMouseLeave={(e) => { if(isRecording) { setIsRecording(false); try { recognitionRef.current?.stop(); } catch(err){} } }}
              className={`w-full border rounded-xl py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors group select-none ${isRecording ? 'bg-danger/20 border-danger text-danger' : 'bg-surfaceLight hover:bg-surfaceLight shadow-sm border-borderLight text-textPrimary'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-danger/40 animate-pulse' : 'bg-primary/20 group-hover:bg-primary/40'}`}>
                <Mic className={`w-4 h-4 ${isRecording ? 'text-textPrimary' : 'text-primary'}`} />
              </div>
              {isRecording ? 'Listening... Release to stop' : 'Hold to Speak'}
            </button>
            <p className="mt-2 text-xs text-textSecondary text-center">Speech will be transcribed directly into the description box.</p>
          </div>

          {/* AI Analysis Section */}
          {showAnalysis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 relative"
            >
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-borderLight"></div>
              </div>
              <div className="relative flex justify-center mb-6">
                <span className="px-3 bg-surface shadow-sm text-xs font-semibold tracking-widest text-textSecondary uppercase">
                  AI Analysis
                </span>
              </div>
              
              <div className="bg-surfaceLight border border-borderLight rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textSecondary">Department</span>
                  <span className="font-medium text-textPrimary">{aiData?.predicted_department || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textSecondary">Priority</span>
                  <span className="flex items-center gap-1.5 font-bold text-danger bg-danger/10 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3.5 h-3.5" /> {aiData?.predicted_priority?.toUpperCase() || 'HIGH'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textSecondary">Sentiment</span>
                  <span className="font-mono text-textPrimary">{aiData?.sentiment || 'Neutral'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textSecondary">Duplicate Found</span>
                  <span className="font-medium text-textPrimary">{aiData?.is_duplicate ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-textSecondary">Fake Photo Detected</span>
                  <span className={`font-medium ${aiData?.is_fake_image ? 'text-danger font-bold' : 'text-success'}`}>
                    {aiData?.is_fake_image ? 'Yes (Warning)' : 'No'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="button"
              className={`w-full ${isSubmitting ? 'bg-gray-500' : 'bg-primary hover:bg-accent'} text-background font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]`}
              onClick={handleAnalyze}
              disabled={isSubmitting}
            >
              <Check className="w-5 h-5" /> {isSubmitting ? 'Analyzing & Submitting...' : 'Analyze & Submit Complaint'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
