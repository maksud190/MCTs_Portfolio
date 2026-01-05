import { useState } from "react";

export default function TagsInput({ tags, setTags }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setInputValue("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const suggestedTags = ["design", "illustration", "photography", "ui/ux", "3d", "animation", "web", "mobile"];

  const addSuggestedTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Tags
        <span className="text-gray-500 font-normal text-xs">(Optional)</span>
      </label>

      {/* Tags Input Container */}
      <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-xl bg-white min-h-[3.5rem] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3  bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg text-sm font-semibold group"
          >
            <span className="text-blue-700">#</span>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="!p-0 hover:bg-red-100 rounded-md transition-colors group"
            >
              <svg
                className="w-4 h-4 text-blue-600 group-hover:text-red-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
          className="flex-1 min-w-[150px] outline-none bg-transparent text-gray-900 text-sm placeholder-gray-400"
        />
      </div>

      {/* Help Text */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">,</kbd> to add tags</span>
      </div>

      {/* Suggested Tags */}
      <div className="mt-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Suggested tags:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addSuggestedTag(tag)}
              disabled={tags.includes(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tags.includes(tag)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <span className="text-gray-400">#</span>
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}