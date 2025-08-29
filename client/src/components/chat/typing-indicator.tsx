export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs md:max-w-md lg:max-w-lg">
        <div className="typing-indicator rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center space-x-1">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
