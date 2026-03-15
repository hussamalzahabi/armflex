import { Head } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import AppBreadcrumb from '@/Components/AppBreadcrumb';
import AppLayout from '@/Layouts/AppLayout';
import { useTheme } from '@/hooks/useTheme';

const humanizeSlug = (value) => {
    if (!value) {
        return '-';
    }

    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const splitLines = (value) =>
    value
        ? value
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean)
        : [];

const ContentSection = ({ title, content, isDark }) => {
    const lines = splitLines(content);

    if (lines.length === 0) {
        return null;
    }

    return (
        <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className={`m-0 text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {title}
            </h3>
            <div className={`mt-3 space-y-2 text-sm leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                {lines.length === 1 ? (
                    <p className="m-0">{lines[0]}</p>
                ) : (
                    <ul className="m-0 list-disc space-y-2 pl-5">
                        {lines.map((line) => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

const ExercisesShow = ({ exercise }) => {
    const { isDark } = useTheme();
    const breadcrumbItems = [
        { label: 'Dashboard', href: '/' },
        { label: 'Programs', href: '/programs' },
        { label: exercise.name },
    ];

    return (
        <>
            <Head title={exercise.name} />

            <AppLayout title={exercise.name}>
                <div className="w-full lg:max-w-[1100px] lg:mr-auto">
                    <AppBreadcrumb items={breadcrumbItems} />

                    <Card className={`mt-2 !rounded-t-none !border-0 ${isDark ? 'programs-surface-dark' : 'programs-surface-light'}`}>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {exercise.category && (
                                        <Tag
                                            value={exercise.category.name}
                                            rounded
                                            className={`!border-0 !text-xs !font-semibold ${
                                                isDark ? '!bg-blue-500/20 !text-blue-100' : '!bg-blue-100 !text-blue-700'
                                            }`}
                                        />
                                    )}
                                    <Chip
                                        label={humanizeSlug(exercise.difficulty_level)}
                                        className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'}
                                    />
                                    {exercise.is_beginner_friendly && (
                                        <Chip
                                            label="Beginner friendly"
                                            className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'}
                                        />
                                    )}
                                    {exercise.is_isometric && (
                                        <Chip
                                            label="Isometric"
                                            className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h1 className={`m-0 text-3xl font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        {exercise.name}
                                    </h1>
                                    {exercise.short_description && (
                                        <p className={`m-0 max-w-3xl text-base leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                            {exercise.short_description}
                                        </p>
                                    )}
                                    {exercise.purpose && (
                                        <p className={`m-0 max-w-3xl text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {exercise.purpose}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <h2 className={`m-0 text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        Required equipment
                                    </h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {exercise.equipments.length > 0 ? (
                                            exercise.equipments.map((equipment) => (
                                                <Chip
                                                    key={equipment.id}
                                                    label={equipment.name}
                                                    className={`programs-equipment-chip ${isDark ? 'programs-equipment-chip-dark' : 'programs-equipment-chip-light'}`}
                                                />
                                            ))
                                        ) : (
                                            <p className={`m-0 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No equipment listed yet.</p>
                                        )}
                                    </div>
                                </section>

                                <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <h2 className={`m-0 text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        Supported styles
                                    </h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {exercise.styles.length > 0 ? (
                                            exercise.styles.map((style) => (
                                                <Chip
                                                    key={style.id}
                                                    label={style.name}
                                                    className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'}
                                                />
                                            ))
                                        ) : (
                                            <p className={`m-0 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No styles listed yet.</p>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {(exercise.video_embed_url || exercise.primary_video_url || exercise.thumbnail_url) && (
                                <section className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h2 className={`m-0 text-sm font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            Demo video
                                        </h2>
                                        {exercise.primary_video_url && (
                                            <a
                                                href={exercise.primary_video_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`text-sm no-underline ${isDark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-700 hover:text-indigo-600'}`}
                                            >
                                                Open source video
                                            </a>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        {exercise.video_embed_url ? (
                                            <div className="aspect-video overflow-hidden rounded-2xl border border-slate-700/40">
                                                <iframe
                                                    src={exercise.video_embed_url}
                                                    title={`${exercise.name} video`}
                                                    className="h-full w-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : exercise.thumbnail_url ? (
                                            <img
                                                src={exercise.thumbnail_url}
                                                alt={`${exercise.name} thumbnail`}
                                                className="aspect-video w-full rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <p className={`m-0 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                Video is linked, but this source cannot be embedded here yet.
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}

                            <div className="grid gap-4 lg:grid-cols-2">
                                <ContentSection title="Setup instructions" content={exercise.instruction.setup_instructions} isDark={isDark} />
                                <ContentSection title="Execution steps" content={exercise.instruction.execution_steps} isDark={isDark} />
                                <ContentSection title="Coaching cues" content={exercise.instruction.coaching_cues} isDark={isDark} />
                                <ContentSection title="Common mistakes" content={exercise.instruction.common_mistakes} isDark={isDark} />
                                <ContentSection title="Why it matters" content={exercise.instruction.why_it_matters} isDark={isDark} />
                                <ContentSection title="Safety notes" content={exercise.instruction.safety_notes} isDark={isDark} />
                            </div>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
};

export default ExercisesShow;
