import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '50vh', padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} role="img" aria-label="warning">⚠️</div>
          <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="btn btn-primary"
            onClick={this.handleReset}
          >
            Return Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
