import { useState } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState({});
  const notify = (message) => toast(message);

  const resetFileInput = () => {
    setFile(null);
    const fileInput = document.getElementById('file');
    if (fileInput) fileInput.value = '';
  };

  const handleSelectFile = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (!selectedFile) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    const isImage = selectedFile.type && selectedFile.type.startsWith("image/");
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const fileExtension = selectedFile.name.toLowerCase().match(/\.[^.]*$/);
    const hasValidExtension = fileExtension && validExtensions.includes(fileExtension[0]);
    if (!isImage || !hasValidExtension) {
      notify("Please select an image file");
      resetFileInput();
      return;
    }
    if (selectedFile.size > maxSize) {
      notify("Image too large! Maximum size is 20MB");
      resetFileInput();
      return;
    }

    setFile(selectedFile);
  };
  const handleUpload = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("my_file", file);
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        notify(`Upload failed: ${response.status} ${response.statusText}`);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      setRes(json);
      // Reset file input after successful upload
      resetFileInput();
      notify('Upload successful!');
    } catch (error) {
      const userMessage = error.message.includes('Failed to fetch') 
        ? 'Network error. Please check your connection and try again.' 
        : error.message;
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
      />
      <code>
        {Object.keys(res).length > 0
          ? Object.keys(res).map((key) => (
              <p className="output-item" key={key}>
                <span>{key}:</span>
                <span>
                  {typeof res[key] === "object" ? "object" : res[key]}
                </span>
              </p>
            ))
          : null}
      </code>
      {file && (
          <button onClick={handleUpload} className="btn-green" disabled={loading}>
            {loading ? "uploading..." : "upload to cloudinary"}
          </button>
      )}
      <ToastContainer />
    </div>
  );
}
export default App;