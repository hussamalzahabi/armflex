import { Link, router } from '@inertiajs/react';
import { useRef } from 'react';
import { Avatar } from 'primereact/avatar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useTheme } from '@/hooks/useTheme';

const menuItems = [
    { label: 'Training Profile', href: '/profile' },
    { label: 'Programs', href: '/programs' },
    { label: 'Workouts', href: '/workouts' },
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
                className={`inline-flex items-center justify-center rounded-full border transition ${
                    isDark
                        ? 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                } ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}
                aria-label="Open user menu"
            >
                <Avatar
                    label={avatarLabel}
                    shape="circle"
                    className={`${compact ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-sm'} ${
                        isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-700'
                    }`}
                />
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
                                className={`block rounded-lg px-3 py-2 text-sm font-medium no-underline transition ${
                                    isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />

                    <button
                        type="button"
                        onClick={logout}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                            isDark ? 'text-rose-200 hover:bg-rose-500/10' : 'text-rose-700 hover:bg-rose-50'
                        }`}
                    >
                        Logout
                    </button>
                </div>
            </OverlayPanel>
        </div>
    );
};

export default UserActionMenu;
