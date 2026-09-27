import type { ReactNode } from "react";

export type QueryStateBannerProps = {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  loadingMessage?: ReactNode;
  errorMessage?: ReactNode;
  emptyMessage?: ReactNode;
};

export function QueryStateBanner({
  isLoading,
  isError,
  isEmpty,
  loadingMessage = "Loading…",
  errorMessage = "Something went wrong.",
  emptyMessage = "No results.",
}: QueryStateBannerProps) {
  if (isLoading) {
    return (
      <div className="erista-query-banner" data-state="loading" role="status">
        {loadingMessage}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="erista-query-banner" data-state="error" role="alert">
        {errorMessage}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="erista-query-banner" data-state="empty">
        {emptyMessage}
      </div>
    );
  }
  return null;
}
