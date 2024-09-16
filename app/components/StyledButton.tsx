import React from 'react';
import styles from './StyledButton.module.css';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const StyledButton: React.FC<StyledButtonProps> = ({ children, className, ...props }) => {
  return (
    <button 
      className={`${styles.styledButton} ${className || ''}`} 
      {...props}
    >
      <span className={styles.buttonText}>{children}</span>
    </button>
  );
};

export default StyledButton;