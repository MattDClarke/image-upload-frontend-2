import { useRef, useEffect } from 'react';

const ConversionForm = ({
  conversions,
  setConversions,
  visitors,
  setVisitors,
  loading,
  validationErrors,
  onSubmit,
  onReset,
}) => {
  const conversionsInputRef = useRef(null);
  const visitorsInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit();

    // Focus on first error field if validation fails
    if (!success) {
      if (validationErrors.conversions) {
        conversionsInputRef.current?.focus();
      } else if (validationErrors.visitors) {
        visitorsInputRef.current?.focus();
      }
    }
  };

  // Announce errors to screen readers when they change
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      const errorMessage = Object.values(validationErrors).join(', ');
      // The aria-live region will announce this
      console.log('Validation errors:', errorMessage);
    }
  }, [validationErrors]);

  const hasConversionsError = !!validationErrors.conversions;
  const hasVisitorsError = !!validationErrors.visitors;

  return (
    <form onSubmit={handleSubmit} aria-label="Conversion rate calculator form">
      <div
        className="form-group"
        role="group"
        aria-labelledby="conversions-label"
      >
        <label id="conversions-label" htmlFor="conversions">
          Conversions:
        </label>
        <input
          ref={conversionsInputRef}
          id="conversions"
          type="number"
          value={conversions}
          onChange={(e) => setConversions(Number(e.target.value))}
          min="0"
          aria-label="Number of conversions"
          aria-invalid={hasConversionsError}
          aria-describedby={hasConversionsError ? 'conversions-error' : undefined}
          aria-required="true"
        />
        {hasConversionsError && (
          <span
            id="conversions-error"
            className="error-message"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.conversions}
          </span>
        )}
      </div>

      <div
        className="form-group"
        role="group"
        aria-labelledby="visitors-label"
      >
        <label id="visitors-label" htmlFor="visitors">
          Visitors:
        </label>
        <input
          ref={visitorsInputRef}
          id="visitors"
          type="number"
          value={visitors}
          onChange={(e) => setVisitors(Number(e.target.value))}
          min="0"
          aria-label="Number of visitors"
          aria-invalid={hasVisitorsError}
          aria-describedby={hasVisitorsError ? 'visitors-error' : undefined}
          aria-required="true"
        />
        {hasVisitorsError && (
          <span
            id="visitors-error"
            className="error-message"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.visitors}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        aria-live="polite"
      >
        {loading ? 'Calculating...' : 'Calculate Conversion Rate'}
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset form to default values"
      >
        Reset
      </button>
    </form>
  );
};

export default ConversionForm;
