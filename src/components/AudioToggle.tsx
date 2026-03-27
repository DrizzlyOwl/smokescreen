import { Button } from './Button';
import { AudioIcon } from './Icons';
import { useAudio } from '../hooks/useAudio';

interface AudioToggleProps {
  fullWidth?: boolean;
  className?: string;
  size?: 'small inline' | 'medium inline' | 'small' | 'large';
  variant?: 'terminal' | 'primary' | 'danger' | 'mobile' | 'mobile-outline';
  style?: React.CSSProperties;
  labelPrefix?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

export const AudioToggle = ({ 
  fullWidth = false, 
  className = '', 
  size = 'small',
  variant = 'terminal',
  style = {},
  labelPrefix = 'AUDIO_SYSTEM',
  activeLabel = 'ACTIVE',
  inactiveLabel = 'SILENCED'
}: AudioToggleProps) => {
  const { isAudioOn, setIsAudioOn, initAudio } = useAudio();

  const handleToggle = () => {
    initAudio();
    setIsAudioOn(!isAudioOn);
  };

  return (
    <Button
      onClick={handleToggle}
      active={isAudioOn}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      className={className}
      style={style}
    >
      <AudioIcon />
      {labelPrefix}: {isAudioOn ? activeLabel : inactiveLabel}
    </Button>
  );
};
