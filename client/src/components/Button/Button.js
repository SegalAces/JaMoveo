import './Button.css';

export default function Button({ title, type = 'button', className = '', ...props }) {
    return (
        <button className={`custom-button ${className}`} type={type} {...props}>
            {title}
        </button>
    );
}