import { useTheme } from '../Context/ThemeContext';
import { Sun, Moon, Palette } from 'lucide-react';

const ThemeToggle = ({ collapsed }) => {
    const { theme, setTheme, toggleTheme } = useTheme();

    if (collapsed) {
        return (
            <button
                onClick={toggleTheme}
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                title="Toggle Theme"
            >
                {theme === 'light' ? <Moon size={18} /> : theme === 'dark' ? <Palette size={18} /> : <Sun size={18} />}
            </button>
        );
    }

    return (
        <div className="dropdown w-100">
            <button
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center justify-content-center gap-2 w-100"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ borderRadius: '20px', padding: '5px 15px' }}
            >
                {theme === 'light' && <><Sun size={18} /> Light</>}
                {theme === 'dark' && <><Moon size={18} /> Dark</>}
                {theme === 'blue' && <><Palette size={18} /> Blue</>}
            </button>
            <ul className="dropdown-menu shadow">
                <li>
                    <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => setTheme('light')}>
                        <Sun size={16} /> Light Mode
                    </button>
                </li>
                <li>
                    <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => setTheme('dark')}>
                        <Moon size={16} /> Dark Mode
                    </button>
                </li>
                <li>
                    <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => setTheme('blue')}>
                        <Palette size={16} /> Blue Theme
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default ThemeToggle;
