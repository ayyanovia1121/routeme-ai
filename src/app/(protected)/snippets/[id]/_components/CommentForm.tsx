import { useState } from "react";

interface CommentFormProps {
    onSubmit: () =>Promise<void>;
    isSubmitting: boolean;
}

function CommentForm({onSubmit, isSubmitting}: CommentFormProps ){
    const [comment, setComment] = useState("");
    const [isPreview, setIsPreview] = useState(false);

    const handleKeyDown = () => {}
    const handleSubmit = () => {}
return (
  <form onSubmit={handleSubmit} className="mb-8">
    <div className="bg-[#0a0a0f] rounded-xl border border-[#ffffff0a] overflow-hidden">
      {/* Comment form header */}
      <div className="flex justify-end gap-2 px-4 pt-2">
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`text-sm px-3 py-1 rounded-md transition-colors ${
            isPreview
              ? "bg-blue-500/10 text-blue-400"
              : "hover:bg-[#ffffff08] text-gray-400"
          }`}
        >
          {isPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Comment form body */}
      {isPreview ? (
        <div className="min-h-[120px] p-4 text-[#e1e1e3">
          {/* <CommentContent content={comment} /> */}
        </div>
      ) : (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add to the discussion..."
          className="w-full bg-transparent border-0 text-[#e1e1e3] placeholder:text-[#808086] outline-none 
            resize-none min-h-[120px] p-4 font-mono text-sm"
        />
      )}

      {/* Comment Form Footer */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#080809] border-t border-[#ffffff0a]">
        
      </div>
    </div>
  </form>
);
}
export default CommentForm;