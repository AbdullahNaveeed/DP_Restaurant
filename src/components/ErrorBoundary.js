"use client";

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-xl text-center">
            <h2 className="mb-4 text-xl font-semibold">Something went wrong.</h2>
            <p className="mb-6 text-sm text-text-muted">Please refresh the page or try again later.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary mx-auto rounded-full px-6 py-2"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
