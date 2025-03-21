interface ProgressBarProps {
    step: number;
  }
  
  export const ProgressBar = ({ step }: ProgressBarProps) => {
    const steps = ["Date/Heure", "Vérification", "Confirmation", "Succès"];
  
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center">
          {steps.map((label, index) => (
            <div key={index} className="flex flex-col items-left">
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index <= step ? "bg-yellow-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  {index <= step && (
                    <span className="text-white text-sm">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 ${
                      index < step ? "bg-yellow-500" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                )}
              </div>
              <span
                className={`mt-2 text-sm ${
                  index <= step
                    ? "text-black dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
                style={{ marginLeft: "-10px" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };