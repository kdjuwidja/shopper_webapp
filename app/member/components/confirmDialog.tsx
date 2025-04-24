interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 dark:bg-black/90 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 
                     text-gray-800 font-medium rounded-md 
                     transition-colors duration-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 
                     text-white font-medium rounded-md 
                     transition-colors duration-200"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
} 