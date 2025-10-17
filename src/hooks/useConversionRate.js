import { useState } from 'react';
import { toast } from 'react-toastify';
import * as Sentry from "@sentry/react";
import { validateConversionRateResponse, sanitizeErrorMessage } from '../utils/sanitize';

export const useConversionRate = () => {
  const [conversions, setConversions] = useState(1);
  const [visitors, setVisitors] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateInputs = () => {
    const errors = {};

    if (conversions < 0) {
      errors.conversions = 'Conversions must be a positive number';
    }

    if (visitors < 0) {
      errors.visitors = 'Visitors must be a positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateConversionRate = async () => {
    if (!validateInputs()) {
      return false;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/calculate-conversion-rate`, {
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

      // Handle API errors (non-OK responses from the server)
      if (!response.ok) {
        const errorMessage = sanitizeErrorMessage(data.message || 'An error occurred');
        setError(errorMessage);
        toast.error(errorMessage);

        // Report API error to Sentry with context
        Sentry.captureException(new Error(`API Error: ${response.status} ${response.statusText}`), {
          level: 'warning',
          tags: {
            errorType: 'api_error',
            statusCode: response.status,
          },
          extra: {
            apiMessage: data.message,
            statusCode: response.status,
            statusText: response.statusText,
            requestBody: { conversions, visitors },
          },
        });

        return false;
      }

      // Validate and sanitize the response data
      const validatedData = validateConversionRateResponse(data);

      if (!validatedData) {
        const errorMessage = 'Invalid response data received from server';
        setError(errorMessage);
        toast.error(errorMessage);

        // Report validation error to Sentry
        Sentry.captureException(new Error('Invalid API response structure'), {
          level: 'error',
          tags: {
            errorType: 'validation_error',
          },
          extra: {
            responseData: data,
            expectedFields: ['message', 'conversions', 'visitors'],
          },
        });

        return false;
      }

      setResult(validatedData);
      toast.success('Conversion rate calculated successfully!');
      return true;

    } catch (err) {
      // Only network errors and JSON parsing errors reach here
      const errorMessage = sanitizeErrorMessage('Network error occurred. Please check your connection.');
      setError(errorMessage);
      console.log(err);

      // Report network/parsing error to Sentry
      Sentry.captureException(err, {
        level: 'error',
        tags: {
          errorType: 'network_error',
        },
        extra: {
          errorName: err.name,
          requestBody: { conversions, visitors },
        },
      });

      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setConversions(1);
    setVisitors(1);
    setResult(null);
    setError(null);
    setValidationErrors({});
  };

  return {
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
  };
};
