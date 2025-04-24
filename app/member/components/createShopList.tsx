import { useCreateShopList } from './createShopListLogic';
import type { CreateShopListProps } from './createShopListLogic';

export function CreateShopList(props: CreateShopListProps) {
  const {
    name,
    setName,
    handleSubmit,
    onCancel
  } = useCreateShopList(props);

  return (
    <div className="fixed inset-0 bg-black/75 dark:bg-black/90 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Create New Shop List</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter list name"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 
                       text-gray-800 font-medium rounded-md 
                       transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white font-medium rounded-md 
                       transition-colors duration-200"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 