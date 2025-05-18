"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebsitePreviewProps {
  defaultUrl?: string;
  className?: string;
}

export default function WebsitePreview({ 
  defaultUrl = "https://nextjs.org", 
  className 
}: WebsitePreviewProps) {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url') || defaultUrl;
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Navigate to specific path
  const navigateToPath = (path: string) => {
    if (!path.startsWith('http')) {
      // Handle relative paths
      const urlObj = new URL(url);
      const newUrl = `${urlObj.origin}${path}`;
      setUrl(newUrl);
      setInputUrl(newUrl);
    } else {
      setUrl(path);
      setInputUrl(path);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let newUrl = inputUrl.trim();
    
    try {
      // Add https:// if no protocol is specified
      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        newUrl = `https://${newUrl}`;
      }
      
      // Validate URL
      new URL(newUrl);
      
      setUrl(newUrl);
      setInputUrl(newUrl);
      setIsLoading(true);
    } catch (err) {
      setError('Please enter a valid URL');
    }
  };

  // Handle iframe errors
  const handleIframeError = () => {
    setError('Unable to load the website. This may be due to security restrictions.');
    setIsLoading(false);
  };

  // Expose navigation method to window for external access
  useEffect(() => {
    (window as any).navigateToPath = navigateToPath;
    
    // Handle iframe load event
    const handleIframeLoad = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);
    }
    
    return () => {
      (window as any).navigateToPath = undefined;
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      }
    };
  }, [url]);

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <form onSubmit={handleSubmit} className="p-4 border-b flex gap-2">
        <Input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter website URL"
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </form>
      
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="h-full w-full border-0"
          title="Website Preview"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
          onLoad={() => setIsLoading(false)}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
}