import { ToastContainer } from 'react-toastify';
import { useConversionRate } from './hooks/useConversionRate';
import ConversionForm from './components/ConversionForm';
import ConversionResult from './components/ConversionResult';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const {
    conversions,
    setConversions,
    visitors,
    setVisitors,
    result,
    loading,
    error,
    validationErrors,
    calculateConversionRate,
    reset,
  } = useConversionRate();

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>Analytics Conversion Rate Calculator</h1>
      <ConversionForm
        conversions={conversions}
        setConversions={setConversions}
        visitors={visitors}
        setVisitors={setVisitors}
        loading={loading}
        validationErrors={validationErrors}
        onSubmit={calculateConversionRate}
        onReset={reset}
      />
      <ConversionResult result={result} error={error} />
    </div>
  );
}
export default App;