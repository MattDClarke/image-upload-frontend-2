import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import './App.css';
import * as Sentry from "@sentry/react";

function App() {
  const [conversions, setConversions] = useState(1);
  const [visitors, setVisitors] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/calculate-conversion-rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversions: Number(conversions),
          visitors: Number(visitors),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.message || 'An error occurred';
        setError(errorMessage);
        toast.error(errorMessage);
        console.log('!response.ok')
        throw new Error(errorMessage);
      } else {
        setResult(data);
        toast.success('Conversion rate calculated successfully!');
      }
    } catch (err) {
      console.log('error');
      const errorMessage = err.message || 'Network error occurred';
      console.log(err)
      Sentry.captureException(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConversions(1);
    setVisitors(1);
    setResult(null);
    setError(null);
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>Analytics Conversion Rate Calculator</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="conversions">Conversions:</label>
          <input
            id="conversions"
            type="number"
            value={conversions}
            onChange={(e) => setConversions(e.target.value)}
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="visitors">Visitors:</label>
          <input
            id="visitors"
            type="number"
            value={visitors}
            onChange={(e) => setVisitors(e.target.value)}
            min="0"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Conversion Rate'}
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>

      {result && (
        <div className="result success">
          <h3>Success!</h3>
          <p>{result.message}</p>
          <p>Conversions: {result.conversions}</p>
          <p>Visitors: {result.visitors}</p>
        </div>
      )}

      {error && (
        <div className="result error">
          <h3>Error!</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
export default App;