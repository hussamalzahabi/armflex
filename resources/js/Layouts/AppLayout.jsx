import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import ThemeToggle from '@/Components/ThemeToggle';
import UserActionMenu from '@/Components/UserActionMenu';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Training Profile', href: '/profile' },
    { label: 'Programs', href: '/programs' },
    { label: 'Workouts', href: '/workouts' },
];

const isActivePath = (currentPath, href) => {
    if (href === '/') {
        return currentPath === '/';
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
};

const toBreadcrumbItems = (breadcrumb) => {
    if (!Array.isArray(breadcrumb) || breadcrumb.length === 0) {
        return { model: [], home: null };
    }

    const [first, ...rest] = breadcrumb;

    const home = first?.href
        ? {
              icon: 'pi pi-home',
              command: () => router.visit(first.href),
          }
        : null;

    const model = (first?.href ? rest : breadcrumb).map((item) => ({
        label: item.label,
        ...(item.href ? { command: () => router.visit(item.href) } : {}),
    }));

    return { model, home };
};

const AppLayout = ({ title, breadcrumb = [], actions = null, children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth, onboardingStatus } = usePage().props;
    const { isDark, toggleTheme } = useTheme();

    const currentPath = useMemo(() => {
        if (typeof window === 'undefined') {
            return '/';
        }

        return window.location.pathname;
    }, []);

    const { model: breadcrumbModel, home: breadcrumbHome } = useMemo(() => toBreadcrumbItems(breadcrumb), [breadcrumb]);

    const shellClass = isDark
        ? 'bg-[radial-gradient(circle_at_top_left,_#101827,_#060b18_55%)] text-slate-100'
        : 'bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#e2e8f0_55%)] text-slate-900';
    const panelClass = isDark ? 'bg-slate-900/92' : 'bg-white/95';
    const bodyPanelClass = isDark ? 'bg-slate-950/35' : 'bg-slate-50/70';
    const contentPanelClass = isDark ? 'bg-slate-950/35' : 'bg-slate-50/70';
    const mutedClass = isDark ? 'text-slate-300' : 'text-slate-500';

    return (
        <div className={`flex h-screen flex-col overflow-hidden ${shellClass}`}>
            <div className={`sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden ${panelClass}`}>
                <button
                    type="button"
                    className={`rounded-md border px-3 py-1.5 text-sm ${isDark ? 'border-slate-700' : 'border-slate-300'}`}
                    onClick={() => setMobileMenuOpen(true)}
                >
                    Menu
                </button>
                <p className="text-sm font-semibold tracking-wide">ArmFlex</p>
                <div className="flex items-center gap-2">
                    <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                    <UserActionMenu user={auth?.user} compact />
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className={`relative h-full w-64 p-5 ${panelClass}`}>
                        <div className="mb-8 flex items-center justify-between">
                            <p className="text-lg font-semibold">ArmFlex</p>
                            <button
                                type="button"
                                className={`rounded-md border px-2 py-1 text-xs ${isDark ? 'border-slate-700' : 'border-slate-300'}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Close
                            </button>
                        </div>

                        {onboardingStatus && !onboardingStatus.all_completed && (
                            <div
                                className={`mb-5 rounded-xl border px-3 py-2 ${
                                    isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'
                                }`}
                            >
                                <p className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${mutedClass}`}>Onboarding</p>
                                <p className="text-sm font-medium">
                                    Progress: {onboardingStatus.completed_count} / {onboardingStatus.total_count} steps completed
                                </p>
                            </div>
                        )}

                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = isActivePath(currentPath, item.href);

                                return (
                                    <Link
                                        key={`mobile-${item.href}`}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? isDark
                                                    ? 'bg-slate-700 text-slate-50'
                                                    : 'bg-slate-900 text-white'
                                                : isDark
                                                  ? 'text-slate-200 hover:bg-slate-800'
                                                  : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            )}

            <div className="flex min-h-0 flex-1">
                <aside className={`hidden w-64 shrink-0 lg:flex lg:h-full lg:flex-col ${panelClass}`}>
                    <div className="p-6">
                        <Link href="/" className="app-brand-link text-xs uppercase tracking-[0.2em] text-slate-500">
                            ArmFlex
                        </Link>

                        {onboardingStatus && !onboardingStatus.all_completed && (
                            <div
                                className={`mt-4 rounded-xl border px-3 py-2 ${
                                    isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'
                                }`}
                            >
                                <p className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${mutedClass}`}>Onboarding</p>
                                <p className="text-sm font-medium">
                                    Progress: {onboardingStatus.completed_count} / {onboardingStatus.total_count} steps completed
                                </p>
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 space-y-2 p-4">
                        {navItems.map((item) => {
                            const isActive = isActivePath(currentPath, item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`app-sidebar-link block rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition ${
                                        isActive
                                            ? isDark
                                                ? 'bg-slate-700 text-slate-50'
                                                : 'bg-slate-900 text-white'
                                            : isDark
                                              ? 'text-slate-200 hover:bg-slate-800'
                                              : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className={`flex min-w-0 flex-1 flex-col overflow-hidden ${bodyPanelClass}`}>
                    <header className={`hidden px-6 py-3 lg:block ${panelClass}`}>
                        <div className="flex items-center justify-between gap-6">
                            <div className="min-w-0">
                                {(breadcrumbHome || breadcrumbModel.length > 0) && (
                                    <BreadCrumb
                                        model={breadcrumbModel}
                                        home={breadcrumbHome}
                                        className={`app-breadcrumb app-breadcrumb-pill border-0 px-0 py-0 ${isDark ? 'app-breadcrumb-dark' : 'app-breadcrumb-light'}`}
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                                <UserActionMenu user={auth?.user} />
                            </div>
                        </div>
                    </header>

                    <main className={`flex min-h-0 flex-1 flex-col rounded-tl-[2rem] ${contentPanelClass} px-4 py-2 sm:px-5 sm:py-3 lg:px-5 lg:py-3`}>
                        <div className="mb-5 lg:hidden">
                            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                            {breadcrumbModel.length > 0 && (
                                <BreadCrumb
                                    model={breadcrumbModel}
                                    home={breadcrumbHome}
                                    className={`app-breadcrumb app-breadcrumb-pill mt-2 border-0 px-0 py-0 ${isDark ? 'app-breadcrumb-dark' : 'app-breadcrumb-light'}`}
                                />
                            )}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <div className="space-y-3 pb-3">
                                {actions && <div>{actions}</div>}
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
