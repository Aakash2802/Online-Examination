export default function QuestionDisplay({ question, answer, onAnswerChange, questionNumber }) {
  if (!question) return null;

  const renderOptions = () => {
    switch (question.type) {
      case 'mcq_single':
        return (
          <div className="space-y-3">
            {question.options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-start space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all stagger-item"
              >
                <input
                  type="radio"
                  name={question._id}
                  value={opt.text}
                  checked={answer === opt.text}
                  onChange={(e) => onAnswerChange(question._id, e.target.value)}
                  className="mt-1 form-radio text-blue-600 focus:ring-blue-500"
                />
                <span className="flex-1">{opt.text}</span>
              </label>
            ))}
          </div>
        );

      case 'mcq_multiple':
        const selectedAnswers = Array.isArray(answer) ? answer : [];
        return (
          <div className="space-y-3">
            {question.options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-start space-x-3 p-4 border-2 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all stagger-item"
              >
                <input
                  type="checkbox"
                  value={opt.text}
                  checked={selectedAnswers.includes(opt.text)}
                  onChange={(e) => {
                    const newAnswers = e.target.checked
                      ? [...selectedAnswers, opt.text]
                      : selectedAnswers.filter((a) => a !== opt.text);
                    onAnswerChange(question._id, newAnswers);
                  }}
                  className="mt-1 form-checkbox text-blue-600 focus:ring-blue-500"
                />
                <span className="flex-1">{opt.text}</span>
              </label>
            ))}
            <p className="text-xs text-gray-500 mt-2">Select all that apply</p>
          </div>
        );

      case 'short_text':
        return (
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => onAnswerChange(question._id, e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your answer here..."
          />
        );

      case 'long_text':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => onAnswerChange(question._id, e.target.value)}
            className="w-full px-4 py-3 border rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your detailed answer here..."
          />
        );

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  onAnswerChange(question._id, file.name);
                }
              }}
              className="hidden"
              id={`file-${question._id}`}
            />
            <label
              htmlFor={`file-${question._id}`}
              className="cursor-pointer text-blue-600 hover:text-blue-700"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2">Click to upload file</p>
              {answer && <p className="mt-2 text-sm text-green-600">Uploaded: {answer}</p>}
            </label>
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-xl animate-fadeInUp hover-lift">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800 text-gradient">
          Question {questionNumber}
        </h2>
        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-semibold px-4 py-1 rounded-full border border-blue-200">
          {question.points} {question.points === 1 ? 'point' : 'points'}
        </span>
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed">{question.prompt}</p>

      {renderOptions()}

      {question.negativeMarking > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl animate-fadeIn">
          <p className="text-xs text-yellow-800">
            ⚠️ Negative marking: -{question.negativeMarking} points for incorrect answer
          </p>
        </div>
      )}
    </div>
  );
}
