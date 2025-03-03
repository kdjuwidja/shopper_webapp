import { useState } from "react";

export function Search() {
  const [query, setQuery] = useState("");
  const [distance, setDistance] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    // TODO: Implement search functionality
    console.log(`Searching for ${query} within ${distance}km`);
  };

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <div className="max-w-[500px] w-full space-y-6 px-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 dark:text-gray-200">I want to buy</span>          
          </div>
          <div className="flex items-center gap-3">
            <textarea
                placeholder="Enter product names, separated by commas"
                className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
              />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-700 dark:text-gray-200">within</span>
            <input
              type="number"
              value={distance}
              min={1}
              className="w-20 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
              onChange={(e) => setDistance(Number(e.target.value))}
            />
            <span className="text-gray-700 dark:text-gray-200">km</span>
            <br />
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Find products"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
