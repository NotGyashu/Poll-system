import { usePollTimer } from '../../hooks';

interface TimerProps {
  initialTime: number;
  onTimerEnd?: () => void;
  className?: string;
}

export const Timer = ({ initialTime, onTimerEnd, className = '' }: TimerProps) => {
  const { formattedTime, isLowTime } = usePollTimer({
    initialTime,
    onTimerEnd,
  });

  const timerColor = isLowTime ? 'text-timer-red' : 'text-gray-700';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`text-2xl font-bold ${timerColor}`}>
        {formattedTime}
      </div>
      {isLowTime && (
        <span className="animate-pulse text-timer-red">⏱️</span>
      )}
    </div>
  );
};
