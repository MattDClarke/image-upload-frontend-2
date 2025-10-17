import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as Sentry from "@sentry/react";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // maximum image upload file size = 20 MB
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const UPLOAD_TIMEOUT = 60000; // 60 second timeout

export default function ImgUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const notify = (message) => toast(message);

  const resetFileInput = () => {
    setFile(null);
    setUploadProgress(0);
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectFile = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (!selectedFile) return;

    // Client-side validation for UX only. Server MUST validate file type and size.
    const isImage = selectedFile.type && selectedFile.type.startsWith("image/");
    const fileExtension = selectedFile.name.toLowerCase().match(/\.[^.]*$/);
    const hasValidExtension = fileExtension && VALID_IMAGE_EXTENSIONS.includes(fileExtension[0]);
    if (!isImage || !hasValidExtension) {
      notify("Please select an image file");
      resetFileInput();
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      notify("Image too large! Maximum size is 20MB");
      resetFileInput();
      return;
    }

    setFile(selectedFile);
    setStatusMessage(`Selected: ${selectedFile.name}`);
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setUploadProgress(0);
    setStatusMessage('Upload cancelled');
    notify('Upload cancelled');
  };

  const handleUpload = async () => {
    if (!file || loading) return;

    // Validate API URL is configured
    const API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) {
      const error = new Error('API URL is not configured');
      Sentry.captureException(error);
      notify('Configuration error. Please contact support.');
      return;
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, UPLOAD_TIMEOUT);

    try {
      setLoading(true);
      setUploadProgress(0);
      setStatusMessage('Uploading...');

      const data = new FormData();
      data.append("my_file", file);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: data,
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Upload failed: please try again.";
        notify(errorMessage);
        // Don't throw here - let the error be captured as-is
        const error = new Error(errorMessage);
        Sentry.captureException(error);
        setStatusMessage('Upload failed');
        return;
      }

      // Reset file input after successful upload
      resetFileInput();
      setStatusMessage('Upload successful!');
      notify('Upload successful!');
    } catch (error) {
      clearTimeout(timeoutId);

      // Capture all errors to Sentry
      Sentry.captureException(error);

      // Provide user-friendly error messages based on error type
      let userMessage = 'An error occurred during upload. Please try again.';
      let statusMsg = 'Upload failed';

      if (error instanceof TypeError) {
        userMessage = 'Network error. Please check your connection and try again.';
        statusMsg = 'Network error';
      } else if (error instanceof Error && error.name === 'AbortError') {
        userMessage = 'Upload timed out. Please try again.';
        statusMsg = 'Upload timed out';
      }

      setStatusMessage(statusMsg);
      notify(userMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  };

  return (
    <div>
      <label htmlFor="file" className="btn-grey">
        select file
      </label>
      <input
        id="file"
        type="file"
        onChange={handleSelectFile}
        multiple={false}
        accept="image/*"
        aria-label="Select an image file to upload"
        ref={fileInputRef}
      />
      {file && (
        <div role="region" aria-live="polite">
          <p id="file-info">
            Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
          {loading && uploadProgress > 0 && (
            <p aria-label={`Upload progress: ${uploadProgress}%`}>
              Progress: {uploadProgress}%
            </p>
          )}
          <button
            onClick={handleUpload}
            className="btn-green"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "uploading..." : "upload to cloudinary"}
          </button>
          {loading ? (
            <button
              onClick={handleCancelUpload}
              className="btn-grey"
              aria-label="Cancel upload"
            >
              cancel
            </button>
          ) : (
            <button
              onClick={resetFileInput}
              className="btn-grey"
              aria-label="Clear selected file"
            >
              clear
            </button>
          )}
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {statusMessage}
          </span>
        </div>
      )}
    </div>
  );
}
