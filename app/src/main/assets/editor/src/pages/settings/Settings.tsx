import { state, effect, mount } from "levelojs";
import { Theme } from "../../components/Theme";
import './settings.css';
import { ArrowLeft } from "kivex-levelo";

export default function Settings() {
    const [theme, setTheme] = state('light');

    mount(() => {
        const appTheme = localStorage.getItem("app-theme") || "light";
        setTheme(appTheme);
    });

    return (
        <div class="settings">
            <div class="head">
                <button onClick={() => window.history.back()}>
                    <ArrowLeft class="svg" />
                </button>
                <h2>Settings</h2>
            </div>
            
            <div class="buttons">
                <button class="settings_button">
                    App Theme
                    <select id="theme" value={theme()} onChange={(e) => {setTheme((e.target as HTMLSelectElement).value); Theme((e.target as HTMLSelectElement).value)}}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </button>
                <button class="settings_button">Editor Settings</button>
                <button class="settings_button">About</button>
                <button class="settings_button">Help</button>
            </div>
        </div>
    )
}