import { Link, router } from '@inertiajs/react';
import { useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useTheme } from '@/hooks/useTheme';

const menuItems = [
    { label: 'Training Profile', href: '/profile', icon: 'pi pi-user-edit' },
    { label: 'Programs', href: '/programs', icon: 'pi pi-sparkles' },
    { label: 'Workouts', href: '/workouts', icon: 'pi pi-play-circle' },
];

const UserActionMenu = ({ user, compact = false }) => {
    const overlayRef = useRef(null);
    const { isDark } = useTheme();
    const displayName = user?.name?.trim() || null;
    const displayEmail = user?.email ?? '';
    const avatarLabel = (displayName?.[0] ?? displayEmail?.[0] ?? 'U').toUpperCase();

    const toggleMenu = (event) => {
        overlayRef.current?.toggle(event);
    };

    const closeMenu = () => {
        overlayRef.current?.hide();
    };

    const logout = () => {
        closeMenu();
        router.post('/logout');
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleMenu}
                className={`inline-flex cursor-pointer items-center justify-center rounded-full border transition ${
                    isDark
                        ? 'border-slate-700 bg-slate-800/90 text-slate-100 shadow-[0_10px_25px_rgba(15,23,42,0.28)] hover:border-slate-500 hover:bg-slate-700/90'
                        : 'border-slate-200 bg-white text-slate-700 shadow-[0_10px_25px_rgba(148,163,184,0.18)] hover:border-slate-300 hover:bg-slate-50'
                } ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}
                aria-label="Open user menu"
            >
                <span className={`flex h-full w-full items-center justify-center rounded-full font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                    {avatarLabel}
                </span>
            </button>

            <OverlayPanel
                ref={overlayRef}
                dismissable
                showCloseIcon={false}
                className={`app-overlay-panel app-user-menu !mt-2 w-[18rem] ${
                    isDark ? 'app-overlay-panel-dark' : 'app-overlay-panel-light'
                }`}
            >
                <div className="space-y-3">
                    <div className="space-y-1">
                        {displayName && <p className="m-0 text-sm font-semibold">{displayName}</p>}
                        {displayEmail && <p className={`m-0 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{displayEmail}</p>}
                    </div>

                    <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMenu}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium no-underline transition ${
                                    isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <i className={`${item.icon} text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`} aria-hidden="true" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />

                    <button
                        type="button"
                        onClick={logout}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2 text-left text-sm font-medium transition appearance-none ${
                            isDark ? 'text-rose-200 hover:bg-rose-500/10' : 'text-rose-700 hover:bg-rose-50'
                        }`}
                    >
                        <i className="pi pi-sign-out text-xs" aria-hidden="true" />
                        Logout
                    </button>
                </div>
            </OverlayPanel>
        </div>
    );
};

export default UserActionMenu;
