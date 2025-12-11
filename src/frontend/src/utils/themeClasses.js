// Reusable button classes with x.ai theme
export const buttonClasses = {
  primary: `
    px-6 py-3 rounded-lg font-medium cursor-pointer
    transition-all duration-200
    bg-[var(--xai-primary)] text-[var(--xai-text-primary)]
    border border-[var(--xai-border)]
    hover:bg-[var(--xai-bg-tertiary)]
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none
  `,
  
  secondary: `
    px-6 py-3 rounded-lg font-medium cursor-pointer
    transition-all duration-200
    bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)]
    border border-[var(--xai-border)]
    hover:bg-[var(--xai-bg-secondary)]
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none
  `,
  
  gradient: `
    px-6 py-3 rounded-lg font-medium cursor-pointer
    transition-all duration-200
    bg-[var(--xai-primary)] text-[var(--xai-text-primary)]
    border border-[var(--xai-border)]
    hover:bg-[var(--xai-bg-tertiary)]
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none
  `
};

// Reusable card classes
export const cardClasses = `
  bg-[var(--xai-bg-secondary)] 
  border border-[var(--xai-border)] 
  rounded-2xl p-6 
  transition-all duration-200 hover:border-[var(--xai-border-light)]
`;

// Reusable container classes  
export const containerClasses = `
  min-h-screen 
  bg-[var(--xai-bg-primary)]
  text-[var(--xai-text-primary)]
  transition-colors duration-200
`;

// Reusable header classes
export const headerClasses = `
  bg-[var(--xai-bg-secondary)] 
  border-b border-[var(--xai-border)]
  transition-colors duration-200
`;

// Reusable input classes
export const inputClasses = `
  w-full p-3 rounded-lg
  bg-[var(--xai-bg-tertiary)]
  border border-[var(--xai-border)]
  text-[var(--xai-text-primary)]
  placeholder:text-[var(--xai-text-secondary)]
  focus:outline-none focus:border-[var(--xai-text-primary)]
  transition-all duration-200
`;

// Reusable text classes
export const textClasses = {
  primary: 'text-[var(--xai-text-primary)]',
  secondary: 'text-[var(--xai-text-secondary)]',
  accent: 'text-[var(--xai-text-primary)]'
};