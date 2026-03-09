import { Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import ThemeToggle from '@/Components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Training Profile', href: '/profile' },
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
    const { auth } = usePage().props;
    const { isDark, toggleTheme } = useTheme();

    const currentPath = useMemo(() => {
        if (typeof window === 'undefined') {
            return '/';
        }

        return window.location.pathname;
    }, []);

    const effectiveBreadcrumb = useMemo(() => {
        if (!Array.isArray(breadcrumb) || breadcrumb.length === 0) {
            return [];
        }

        const last = breadcrumb[breadcrumb.length - 1];
        if (last?.label?.toLowerCase() === title.toLowerCase()) {
            return breadcrumb.slice(0, -1);
        }

        return breadcrumb;
    }, [breadcrumb, title]);
    const { model: breadcrumbModel, home: breadcrumbHome } = useMemo(() => toBreadcrumbItems(effectiveBreadcrumb), [effectiveBreadcrumb]);

    const shellClass = isDark
        ? 'bg-[radial-gradient(circle_at_top_left,_#101827,_#060b18_55%)] text-slate-100'
        : 'bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#e2e8f0_55%)] text-slate-900';
    const panelClass = isDark ? 'border-slate-800/80 bg-slate-900/92' : 'border-slate-200/90 bg-white/95';
    const mutedClass = isDark ? 'text-slate-300' : 'text-slate-500';

    return (
        <div className={`min-h-screen ${shellClass}`}>
            <div className={`sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden ${panelClass}`}>
                <button
                    type="button"
                    className={`rounded-md border px-3 py-1.5 text-sm ${isDark ? 'border-slate-700' : 'border-slate-300'}`}
                    onClick={() => setMobileMenuOpen(true)}
                >
                    Menu
                </button>
                <p className="text-sm font-semibold tracking-wide">ArmFlex</p>
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close menu"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className={`relative h-full w-72 border-r p-5 ${panelClass}`}>
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

            <div className="mx-auto flex min-h-screen max-w-[1650px] gap-4 p-4 lg:p-5">
                <aside className={`hidden w-72 shrink-0 rounded-3xl border shadow-sm lg:flex lg:min-h-[calc(100vh-2.5rem)] lg:flex-col ${panelClass}`}>
                    <div className="border-b p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ArmFlex</p>
                        <h1 className="mt-2 text-xl font-semibold">Training Portal</h1>
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

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className={`hidden rounded-3xl border px-6 py-5 shadow-sm lg:block ${panelClass}`}>
                        <div className="flex items-center justify-between gap-6">
                            <div className="min-w-0">
                                <p className={`mb-1 text-xs uppercase tracking-[0.18em] ${mutedClass}`}>Workspace</p>
                                <h2 className="truncate text-2xl font-semibold tracking-tight">{title}</h2>
                                {breadcrumbModel.length > 0 && (
                                    <BreadCrumb
                                        model={breadcrumbModel}
                                        home={breadcrumbHome}
                                        className={`app-breadcrumb mt-2 border-0 px-0 py-0 ${isDark ? 'app-breadcrumb-dark' : 'app-breadcrumb-light'}`}
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                                <div className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>
                                        {(auth?.user?.name?.[0] ?? 'U').toUpperCase()}
                                    </div>
                                    <div className={`text-right text-xs ${mutedClass}`}>
                                        <p className="text-[11px]">Welcome back</p>
                                        <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{auth?.user?.name}</p>
                                        <p>{auth?.user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 pt-2 sm:pt-3 lg:pt-3">
                        <div className="mb-5 lg:hidden">
                            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                            {breadcrumbModel.length > 0 && (
                                <BreadCrumb
                                    model={breadcrumbModel}
                                    home={breadcrumbHome}
                                    className={`app-breadcrumb mt-2 border-0 px-0 py-0 ${isDark ? 'app-breadcrumb-dark' : 'app-breadcrumb-light'}`}
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            {actions && <div>{actions}</div>}
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
