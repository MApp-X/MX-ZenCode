import { state } from 'levelojs';
import { MenuVertical, Check } from 'kivex-levelo';
import './fileactions.css';

export function FileActions() {
    const [isOpen, setIsOpen] = state(false);
    const [showHidden, setShowHidden] = state(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen());
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    const toggleShowHidden = () => {
        setShowHidden(!showHidden());
    };

    return (
        <div class="options-container">
            {isOpen() && (
                <div class="dropdown-overlay" onClick={closeMenu}></div>
            )}

            <button class="menu-btn" onClick={toggleMenu} type="button">
                <MenuVertical class="svg" />
            </button>
            <div class={isOpen() ? "options-menu active" : "options-menu"}>
                <button class="options-item" onClick={toggleShowHidden} type="button">
                    <span class="item-text">Show hidden files</span>
                    <span class={showHidden() ? "checkbox checked" : "checkbox"}>
                        {showHidden() && <Check width={14} height={14} />}
                    </span>
                </button>
            </div>
        </div>
    );
}