import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';

const Register = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />
            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
                <Card title="Create account" className="w-full max-w-md">
                    <form onSubmit={submit} className="p-fluid space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                Name
                            </label>
                            <InputText
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="w-full"
                                autoComplete="name"
                            />
                            {errors.name && <small className="text-red-600">{errors.name}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <InputText
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                className="w-full"
                                autoComplete="email"
                            />
                            {errors.email && <small className="text-red-600">{errors.email}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <Password
                                id="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                toggleMask
                                inputClassName="w-full"
                                className="w-full"
                                autoComplete="new-password"
                            />
                            {errors.password && <small className="text-red-600">{errors.password}</small>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700">
                                Confirm password
                            </label>
                            <Password
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                feedback={false}
                                toggleMask
                                inputClassName="w-full"
                                className="w-full"
                                autoComplete="new-password"
                            />
                        </div>

                        <Button type="submit" label="Register" className="w-full" loading={processing} />
                    </form>

                    <p className="mt-5 text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:underline">
                            Login
                        </Link>
                    </p>
                </Card>
            </main>
        </>
    );
};

export default Register;
