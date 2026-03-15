import { router } from '@inertiajs/react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';

const AppBreadcrumb = ({ items = [], containerClassName = '', breadcrumbClassName = '' }) => {
    const { isDark } = useTheme();

    const model = useMemo(
        () =>
            items.map((item) => ({
                label: item.label,
                ...(item.href ? { command: () => router.visit(item.href) } : {}),
            })),
        [items]
    );

    if (model.length === 0) {
        return null;
    }

    return (
        <section className={`mb-2 rounded-t-3xl px-6 py-4 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} ${containerClassName}`}>
            <BreadCrumb
                model={model}
                className={`app-breadcrumb app-breadcrumb-pill mt-2 border-0 px-0 py-0 ${isDark ? 'app-breadcrumb-dark' : 'app-breadcrumb-light'} ${breadcrumbClassName}`}
            />
        </section>
    );
};

export default AppBreadcrumb;
