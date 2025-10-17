const ConversionResult = ({ result, error }) => {
  if (!result && !error) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={error ? 'result error' : 'result success'}
    >
      {error ? (
        <>
          <h3>Error</h3>
          <p>{error}</p>
        </>
      ) : (
        <>
          <h3>Success!</h3>
          <p>{result.message}</p>
          <dl aria-label="Calculation results">
            <dt>Conversions:</dt>
            <dd>{result.conversions}</dd>
            <dt>Visitors:</dt>
            <dd>{result.visitors}</dd>
          </dl>
        </>
      )}
    </div>
  );
};

export default ConversionResult;
