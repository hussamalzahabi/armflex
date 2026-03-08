import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';

const Home = ({ title }) => {
    const [name, setName] = useState('');

    const greeting = name.trim() ? `Hey ${name}, your dashboard is ready.` : 'Type your name to personalize this card.';

    return (
        <>
            <Head title={title} />
            <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 px-6 py-12">
                <div className="mx-auto max-w-6xl space-y-8">
                    <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-2xl backdrop-blur">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">PrimeReact + Tailwind Showcase</h1>
                            <Tag severity="success" value="Live UI Demo" />
                        </div>
                        <p className="mt-3 max-w-3xl text-slate-600">
                            PrimeReact handles rich UI components while Tailwind controls layout, spacing, typography, and backgrounds.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button label="Primary Action" />
                            <Button label="Secondary" severity="secondary" outlined />
                            <Button label="Danger" severity="danger" text />
                        </div>
                    </section>

                    <section className="grid gap-6 md:grid-cols-2">
                        <Card title="Interactive Card" subTitle="PrimeReact components inside a Tailwind grid">
                            <div className="space-y-4">
                                <span className="p-float-label">
                                    <InputText id="name" value={name} onChange={(event) => setName(event.target.value)} className="w-full" />
                                    <label htmlFor="name">Your name</label>
                                </span>
                                <p className="text-sm text-slate-600">{greeting}</p>
                                <ProgressBar value={name.trim() ? 100 : 35} showValue />
                            </div>
                        </Card>

                        <Card title="Tailwind Utility Preview" subTitle="Quick visual stats with utility-first classes">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-sky-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-sky-700">Widgets</p>
                                    <p className="mt-1 text-2xl font-semibold text-sky-900">12</p>
                                </div>
                                <div className="rounded-xl bg-emerald-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-emerald-700">Tasks</p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-900">24</p>
                                </div>
                                <div className="rounded-xl bg-amber-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-amber-700">Alerts</p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-900">3</p>
                                </div>
                                <div className="rounded-xl bg-rose-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-rose-700">Uptime</p>
                                    <p className="mt-1 text-2xl font-semibold text-rose-900">99.9%</p>
                                </div>
                            </div>
                        </Card>
                    </section>
                </div>
            </main>
        </>
    );
};

export default Home;
