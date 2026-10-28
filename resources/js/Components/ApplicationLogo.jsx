export default function ApplicationLogo({ className = '', alt = 'RepoCred', ...props }) {
    return (
        <img
            src="/images/official/logo.png"
            alt={alt}
            className={className}
            {...props}
        />
    );
}
