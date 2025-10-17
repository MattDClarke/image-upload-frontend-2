import { useEffect, useRef, useState } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Sentry from "@sentry/react";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // maximum image upload file size = 20 MB
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup file reference on unmount
      setFile(null);
    };
  }, []);

  const notify = (message) => toast(message);

  const resetFileInput = () => {
    setFile(null);
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
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    try {
      setLoading(true);
      const data = new FormData();
      data.append("my_file", file);
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Upload failed: please try again.";
        notify(errorMessage);
        throw new Error(errorMessage);
      }
      // Reset file input after successful upload
      resetFileInput();
      notify('Upload successful!');
    } catch (error) {
      Sentry.captureException(error);
      const userMessage = error instanceof TypeError
      ? 'Network error. Please check your connection and try again.'
      : 'An error occurred during upload. Please try again.';
      notify(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <label htmlFor="file" className="btn-grey">
        {" "}
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
        <div>
          <p>Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</p>
          <button onClick={handleUpload} className="btn-green" disabled={loading}>
            {loading ? "uploading..." : "upload to cloudinary"}
          </button>
          <button onClick={resetFileInput} className="btn-grey" disabled={loading}>
            clear
          </button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
export default App;