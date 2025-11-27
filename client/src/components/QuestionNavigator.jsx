export default function QuestionNavigator({ questions, currentIndex, answers, onNavigate }) {
  return (
    <div className="bg-white shadow-lg p-4 rounded-xl hover-lift">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 text-gradient">Question Navigator</h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => {
          const isAnswered = answers[question._id] !== undefined && answers[question._id] !== '';
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={question._id}
              onClick={() => onNavigate(idx)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all transform hover:scale-110 ${
                isCurrent
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white ring-2 ring-blue-400 ring-offset-2 animate-pulse'
                  : isAnswered
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={isAnswered ? 'Answered' : 'Not answered'}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded mr-1"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
            <span>Not Answered</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded mr-1"></div>
            <span>Current</span>
          </div>
        </div>
        <div className="font-semibold text-gradient">
          {Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length} /{' '}
          {questions.length}
        </div>
      </div>
    </div>
  );
}
