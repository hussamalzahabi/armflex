import { Head, Link } from '@inertiajs/react';
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

const panelClass = (isDark) =>
    `rounded-2xl border p-4 md:p-5 ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`;

const SectionHeader = ({ icon, title, isDark, kicker = null, compact = false }) => (
    <div className={`grid grid-cols-[auto_minmax(0,1fr)] ${compact ? 'gap-2.5' : 'gap-3'} items-center`}>
        <div
            className={`flex shrink-0 items-center justify-center rounded-2xl ${
                compact ? 'h-9 w-9' : 'h-10 w-10'
            } ${isDark ? 'bg-slate-800 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}
        >
            <i className={`${icon} ${compact ? 'text-sm' : 'text-base'}`} aria-hidden="true" />
        </div>
        <div className={`min-w-0 ${kicker ? 'flex flex-col justify-center gap-0.5' : 'flex min-h-9 items-center'}`}>
            {kicker && <p className={`m-0 text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{kicker}</p>}
            <h3 className={`m-0 text-sm font-semibold uppercase leading-none tracking-[0.14em] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{title}</h3>
        </div>
    </div>
);

const ContentSection = ({ title, content, icon, isDark, kicker = null }) => {
    const lines = splitLines(content);

    if (lines.length === 0) {
        return null;
    }

    return (
        <section className={panelClass(isDark)}>
            <SectionHeader icon={icon} title={title} kicker={kicker} isDark={isDark} />
            <div className={`mt-4 space-y-2 text-sm leading-relaxed md:text-base ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
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

const MetaRow = ({ icon, label, value, isDark }) => (
    <div className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
        <div className="flex items-center gap-2">
            <i className={`${icon} text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`} aria-hidden="true" />
            <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
        </div>
        <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{value}</span>
    </div>
);

const ExercisesShow = ({ exercise, relatedExercises = [] }) => {
    const { isDark } = useTheme();
    const instructionSections = [
        exercise.instruction.setup_instructions,
        exercise.instruction.execution_steps,
        exercise.instruction.coaching_cues,
        exercise.instruction.common_mistakes,
        exercise.instruction.why_it_matters,
        exercise.instruction.safety_notes,
    ];
    const availableInstructionCount = instructionSections.filter((section) => splitLines(section).length > 0).length;
    const shouldShowReadingOrder = availableInstructionCount >= 2;
    const breadcrumbItems = [
        { label: 'Dashboard', href: '/' },
        { label: 'Programs', href: '/programs' },
        { label: exercise.name },
    ];

    return (
        <>
            <Head title={exercise.name} />

            <AppLayout title={exercise.name}>
                <div className="w-full lg:max-w-[1180px] lg:mr-auto">
                    <AppBreadcrumb items={breadcrumbItems} />

                    <Card className={`mt-2 !rounded-t-none !border-0 ${isDark ? 'programs-surface-dark' : 'programs-surface-light'}`}>
                        <div className="space-y-6 md:space-y-8">
                            <section className="space-y-4">
                                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'bg-slate-800 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}>
                                    <i className="pi pi-compass text-[0.7rem]" aria-hidden="true" />
                                    Exercise guide
                                </div>

                                <div className="space-y-3">
                                    <h1 className={`m-0 text-3xl font-semibold tracking-tight md:text-4xl ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        {exercise.name}
                                    </h1>
                                    {exercise.short_description && (
                                        <p className={`m-0 max-w-4xl text-lg leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                            {exercise.short_description}
                                        </p>
                                    )}
                                    {exercise.purpose && (
                                        <p className={`m-0 max-w-4xl text-sm leading-relaxed md:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {exercise.purpose}
                                        </p>
                                    )}
                                </div>
                            </section>

                            <div className="grid gap-4 xl:grid-cols-3">
                                <section className={panelClass(isDark)}>
                                    <SectionHeader icon="pi pi-info-circle" title="Overview" isDark={isDark} compact />
                                    <div className="mt-4 space-y-2.5">
                                        {exercise.category && <MetaRow icon="pi pi-sitemap" label="Category" value={exercise.category.name} isDark={isDark} />}
                                        {exercise.primary_style && <MetaRow icon="pi pi-star" label="Primary style" value={exercise.primary_style.name} isDark={isDark} />}
                                        <MetaRow icon="pi pi-sparkles" label="Difficulty" value={humanizeSlug(exercise.difficulty_level)} isDark={isDark} />
                                        {exercise.is_beginner_friendly && <MetaRow icon="pi pi-heart" label="Beginner" value="Friendly" isDark={isDark} />}
                                        {exercise.is_isometric && <MetaRow icon="pi pi-stopwatch" label="Format" value="Isometric" isDark={isDark} />}
                                    </div>
                                </section>

                                <section className={panelClass(isDark)}>
                                    <SectionHeader icon="pi pi-wrench" title="Required equipment" isDark={isDark} compact />
                                    <div className="mt-4 flex flex-wrap gap-2">
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

                                <section className={panelClass(isDark)}>
                                    <SectionHeader icon="pi pi-users" title="Supported styles" isDark={isDark} compact />
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {exercise.styles.length > 0 ? (
                                            exercise.styles.map((style) => (
                                                <Chip key={style.id} label={style.name} className={isDark ? 'programs-summary-chip-dark' : 'programs-summary-chip-light'} />
                                            ))
                                        ) : (
                                            <p className={`m-0 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No styles listed yet.</p>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {shouldShowReadingOrder && (
                                <section className={panelClass(isDark)}>
                                    <SectionHeader icon="pi pi-directions-alt" title="Start here" kicker="Recommended reading order" isDark={isDark} />
                                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                                        <div className={`rounded-2xl px-3 py-3 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                                            <p className={`m-0 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>1. Set up</p>
                                            <p className={`mt-2 mb-0 text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                Start with the setup instructions so your arm, hand, and band position feel right.
                                            </p>
                                        </div>
                                        <div className={`rounded-2xl px-3 py-3 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                                            <p className={`m-0 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>2. Move</p>
                                            <p className={`mt-2 mb-0 text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                Read the execution steps next so you know exactly how each rep or hold should feel.
                                            </p>
                                        </div>
                                        <div className={`rounded-2xl px-3 py-3 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'}`}>
                                            <p className={`m-0 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>3. Refine</p>
                                            <p className={`mt-2 mb-0 text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                Use coaching cues, common mistakes, and safety notes to clean up the movement.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section className={panelClass(isDark)}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <SectionHeader icon="pi pi-play-circle" title="Demo video" isDark={isDark} />
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
                                <div className="mt-4">
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
                                        <img src={exercise.thumbnail_url} alt={`${exercise.name} thumbnail`} className="aspect-video w-full rounded-2xl object-cover" />
                                    ) : (
                                        <div className={`rounded-2xl border px-4 py-5 ${isDark ? 'border-slate-700 bg-slate-800/70 text-slate-300' : 'border-slate-200 bg-white/80 text-slate-600'}`}>
                                            <p className="m-0 text-sm font-semibold">Video coming soon.</p>
                                            <p className="mt-1 mb-0 text-sm">Use the written instructions below for now.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <ContentSection title="Setup instructions" kicker="Start with this" content={exercise.instruction.setup_instructions} icon="pi pi-cog" isDark={isDark} />
                                <ContentSection title="Execution steps" kicker="Then do this" content={exercise.instruction.execution_steps} icon="pi pi-play" isDark={isDark} />
                                <ContentSection title="Coaching cues" kicker="Refine the movement" content={exercise.instruction.coaching_cues} icon="pi pi-megaphone" isDark={isDark} />
                                <ContentSection title="Common mistakes" kicker="Watch out for" content={exercise.instruction.common_mistakes} icon="pi pi-exclamation-triangle" isDark={isDark} />
                                <ContentSection title="Why it matters" content={exercise.instruction.why_it_matters} icon="pi pi-star" isDark={isDark} />
                                <ContentSection title="Safety notes" content={exercise.instruction.safety_notes} icon="pi pi-shield" isDark={isDark} />
                            </div>

                            {relatedExercises.length > 0 && (
                                <section className={panelClass(isDark)}>
                                    <SectionHeader icon="pi pi-share-alt" title="Related Exercises" isDark={isDark} />
                                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        {relatedExercises.map((relatedExercise) => (
                                            <Link
                                                key={relatedExercise.id}
                                                href={`/exercises/${relatedExercise.slug}`}
                                                className={`rounded-2xl border p-4 no-underline transition ${
                                                    isDark
                                                        ? 'border-slate-700 bg-slate-800/70 hover:border-slate-600 hover:bg-slate-800'
                                                        : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                                                }`}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className={`m-0 text-base font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                                {relatedExercise.name}
                                                            </h4>
                                                            {relatedExercise.category && (
                                                                <p className={`mt-1 mb-0 text-xs font-medium uppercase tracking-[0.14em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                    {relatedExercise.category.name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <i className={`pi pi-arrow-right text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} aria-hidden="true" />
                                                    </div>
                                                    {relatedExercise.short_description && (
                                                        <p className={`m-0 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                            {relatedExercise.short_description}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
};

export default ExercisesShow;
