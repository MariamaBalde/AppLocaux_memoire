// export default function Button({
//   children,
//   variant = 'primary',
//   size = 'md',
//   isLoading = false,
//   disabled = false,
//   fullWidth = false,
//   ...props
// }) {
//   const baseClasses = 'font-semibold transition rounded hover:opacity-90 disabled:opacity-50';

//   const variants = {
//     primary: 'bg-primary text-white',
//     secondary: 'bg-secondary text-white',
//     success: 'bg-success text-white',
//     danger: 'bg-danger text-white',
//     outline: 'border-2 border-primary text-primary bg-transparent',
//   };

//   const sizes = {
//     sm: 'px-3 py-1 text-sm',
//     md: 'px-4 py-2 text-base',
//     lg: 'px-6 py-3 text-lg',
//   };

//   const classes = `
//     ${baseClasses}
//     ${variants[variant]}
//     ${sizes[size]}
//     ${fullWidth ? 'w-full' : ''}
//   `;

//   return (
//     <button className={classes} disabled={isLoading || disabled} {...props}>
//       {isLoading ? (
//         <span className="flex items-center gap-2">
//           <span className="animate-spin">⟳</span>
//           Chargement...
//         </span>
//       ) : (
//         children
//       )}
//     </button>
//   );
// }

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const baseClasses = 'btn font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-gray-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-danger text-white hover:bg-red-600 disabled:bg-gray-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:border-gray-300 disabled:text-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  );
}