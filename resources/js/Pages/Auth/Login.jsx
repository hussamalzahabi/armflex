import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';

const Login = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />
            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
                <Card title="Sign in" className="w-full max-w-md">
                    <form onSubmit={submit} className="p-fluid space-y-5">
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
                                feedback={false}
                                toggleMask
                                inputClassName="w-full"
                                className="w-full"
                                autoComplete="current-password"
                            />
                            {errors.password && <small className="text-red-600">{errors.password}</small>}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                inputId="remember"
                                checked={data.remember}
                                onChange={(event) => setData('remember', Boolean(event.checked))}
                            />
                            <label htmlFor="remember" className="text-sm text-slate-700">
                                Remember me
                            </label>
                        </div>

                        <Button type="submit" label="Login" className="w-full" loading={processing} />
                    </form>

                    <p className="mt-5 text-sm text-slate-600">
                        No account?{' '}
                        <Link href="/register" className="font-medium text-blue-600 hover:underline">
                            Register
                        </Link>
                    </p>
                </Card>
            </main>
        </>
    );
};

export default Login;
