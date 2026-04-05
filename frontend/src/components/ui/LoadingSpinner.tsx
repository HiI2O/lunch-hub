type LoadingSpinnerProps = {
  readonly label?: string;
};

export function LoadingSpinner({ label = '読み込み中' }: LoadingSpinnerProps): React.JSX.Element {
  return (
    <div className="loading-container" role="status" aria-label={label}>
      <div className="loading-spinner" />
    </div>
  );
}
