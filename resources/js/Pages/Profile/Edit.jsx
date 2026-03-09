import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';

const dominantArmOptions = [
    { label: 'Right', value: 'right' },
    { label: 'Left', value: 'left' },
];

const experienceOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

const Edit = ({ profile }) => {
    const { data, setData, put, processing, errors } = useForm({
        dominant_arm: profile?.dominant_arm ?? 'right',
        experience_level: profile?.experience_level ?? 'beginner',
        weight_kg: profile?.weight_kg ? Number(profile.weight_kg) : null,
        training_days_per_week: profile?.training_days_per_week ?? null,
        notes: profile?.notes ?? '',
    });

    const submit = (event) => {
        event.preventDefault();

        put('/profile');
    };

    return (
        <>
            <Head title="Training Profile" />
            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
                <Card title="Training Profile" className="w-full max-w-xl">
                    <form onSubmit={submit} className="p-fluid space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="dominant_arm" className="block text-sm font-medium text-slate-700">
                                Dominant arm
                            </label>
                            <Dropdown
                                id="dominant_arm"
                                value={data.dominant_arm}
                                options={dominantArmOptions}
                                onChange={(event) => setData('dominant_arm', event.value)}
                                placeholder="Select dominant arm"
                                className="w-full"
                            />
                            {errors.dominant_arm && <small className="text-red-600">{errors.dominant_arm}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="experience_level" className="block text-sm font-medium text-slate-700">
                                Experience level
                            </label>
                            <Dropdown
                                id="experience_level"
                                value={data.experience_level}
                                options={experienceOptions}
                                onChange={(event) => setData('experience_level', event.value)}
                                placeholder="Select experience level"
                                className="w-full"
                            />
                            {errors.experience_level && <small className="text-red-600">{errors.experience_level}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="weight_kg" className="block text-sm font-medium text-slate-700">
                                Weight (kg)
                            </label>
                            <InputNumber
                                inputId="weight_kg"
                                value={data.weight_kg}
                                onValueChange={(event) => setData('weight_kg', event.value)}
                                min={30}
                                max={300}
                                minFractionDigits={0}
                                maxFractionDigits={2}
                                mode="decimal"
                                className="w-full"
                            />
                            {errors.weight_kg && <small className="text-red-600">{errors.weight_kg}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="training_days_per_week" className="block text-sm font-medium text-slate-700">
                                Training days per week
                            </label>
                            <InputNumber
                                inputId="training_days_per_week"
                                value={data.training_days_per_week}
                                onValueChange={(event) => setData('training_days_per_week', event.value)}
                                min={1}
                                max={7}
                                useGrouping={false}
                                className="w-full"
                            />
                            {errors.training_days_per_week && <small className="text-red-600">{errors.training_days_per_week}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                                Notes
                            </label>
                            <InputTextarea
                                id="notes"
                                value={data.notes}
                                onChange={(event) => setData('notes', event.target.value)}
                                rows={4}
                                autoResize
                            />
                            {errors.notes && <small className="text-red-600">{errors.notes}</small>}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" label="Save profile" loading={processing} />
                            <Link href="/">
                                <Button type="button" label="Back" severity="secondary" outlined />
                            </Link>
                        </div>
                    </form>
                </Card>
            </main>
        </>
    );
};

export default Edit;
