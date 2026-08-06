import { File, Search, LayoutGrid } from "kivex-levelo";
import { state } from "levelojs";
import './sidebar.css';
import { SidebarFiles } from "./utils/files/files";

interface SideBarProps {
    isOpen: () => boolean;
    onClose?: () => void;
}

export function SideBar({ isOpen, onClose }: SideBarProps) {
    const [activeTab, setActiveTab] = state<'explorer' | 'search' | 'extensions'>('explorer');
    
    return (
        <div class={isOpen() ? "sidebar active" : "sidebar"}>
            <div class="left">
                <button class={activeTab() === 'explorer' ? 'active-tab' : 'tab-button'} title="Explorer" onClick={() => setActiveTab('explorer')}>
                    <File size={25} class="svg" />
                </button>
                <button title="Search" class={activeTab() === 'search' ? 'active-tab' : 'tab-button'} onClick={() => setActiveTab('search')}>
                    <Search size={25} class="svg" />
                </button>
                <button title="Extensions" class={activeTab() === 'extensions' ? 'active-tab' : 'tab-button'} onClick={() => setActiveTab('extensions')}>
                    <LayoutGrid  size={25} class="svg" />
                </button>
            </div>
            <div class="right">
                {activeTab() === 'explorer' && (
                    <div class="tab-content">
                        <h2>Explorer</h2>
                        <SidebarFiles />
                    </div>
                )}
                {activeTab() === 'search' && (
                    <div class="tab-content">
                        <h2>Search</h2>
                    </div>
                )}
                {activeTab() === 'extensions' && (
                    <div class="tab-content">
                        <h2>Extensions</h2>
                    </div>
                )}
            </div>
        </div>
    );
}