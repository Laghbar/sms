export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
        >
            {/* Mortarboard cap top */}
            <polygon points="32,8 60,22 32,36 4,22" />
            {/* Cap tassel string */}
            <line x1="60" y1="22" x2="60" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="40" r="2.5" />
            {/* Diploma scroll body */}
            <path d="M18,28 L18,46 C18,50 24,54 32,54 C40,54 46,50 46,46 L46,28 L32,35 Z" />
        </svg>
    );
}
