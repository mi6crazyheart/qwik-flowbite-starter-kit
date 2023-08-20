import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeAction$, zod$, z, Form } from '@builder.io/qwik-city';
import { account } from '~/appwrite.config';
import { ID } from 'appwrite'

export const useCreateUserAccount = routeAction$(
    async (user, { fail }) => {

        type SuccessResponse = {
            status: boolean,
            data: {
                id: string,
                name: string,
                email: string,
                phone: string,
                emailVerification: boolean,
                phoneVerification: boolean,
            },
            message: string
        }

        type ErrorResponse = {
            status: boolean,
            error: {
                message: string,
                code: number,
                type: string,
                version: string
            }
            message: string
        }

        let result

        try {
            result = await account.create(
                ID.unique(),
                user.email.toString(),
                user.password.toString(),
                user.name.toString()
            )
            console.log('user account created successfully: ', result)

        } catch (error: any) {
            console.log('Exception caught: ', error)

            const errorResponse: ErrorResponse = {
                status: false,
                error: {
                    message: error.response.message,
                    code: error.response.code,
                    type: error.response.type,
                    version: error.response.version,
                },
                message: 'Exception caught when creating user account'
            }
            return fail(500, errorResponse);
        }

        const response: SuccessResponse = {
            status: true,
            data: {
                id: result['$id'],
                name: result['name'],
                email: result['email'],
                phone: result['phone'],
                emailVerification: result['emailVerification'],
                phoneVerification: result['phoneVerification'],
            },
            message: 'user account created successfully'
        };

        return response
    },
    zod$({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
    })
);

// const defaultValues = { name: '', email: '', password: '' };

export default component$(() => {
    const action = useCreateUserAccount();
    // const nameSig = useSignal(defaultValues.name);
    // const emailSig = useSignal(defaultValues.email);
    // const passwordSig = useSignal(defaultValues.password);
    const refSig = useSignal<HTMLFormElement>();

    useTask$(({ track }) => {
        const status = track(() => action.value?.status);
        if (status) {
            // nameSig.value = defaultValues.name;
            // emailSig.value = defaultValues.email;
            // passwordSig.value = defaultValues.password;
            if (refSig.value) {
                refSig.value.reset();
            }
        }
    });


    return (
        <>
            <section class="bg-gray-50 dark:bg-gray-900">
                <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                        <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
                        Lemonlist
                    </a>
                    <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Signup for a new account
                            </h1>
                            <Form class="space-y-4 md:space-y-6" action={action} ref={refSig}>
                                <div>
                                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                                    <input type="text" name="name" id="name"
                                        class={['bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500', (action.value?.failed && action.value.fieldErrors?.name) ? 'border-red-300' : 'border-gray-300']} placeholder="Write your name" />
                                    {
                                        action.value?.failed && <p class="mt-2 text-sm text-red-600 dark:text-red-500">{action.value.fieldErrors?.name}</p>
                                    }
                                </div>
                                <div>
                                    <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                    <input type="email" name="email" id="email"
                                        class={['bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500', (action.value?.failed && action.value.fieldErrors?.email) ? 'border-red-300' : 'border-gray-300']} placeholder="name@company.com" />
                                    {
                                        action.value?.failed && <p class="mt-2 text-sm text-red-600 dark:text-red-500">{action.value.fieldErrors?.email}</p>
                                    }
                                </div>
                                <div>
                                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <input type="password" name="password" id="password"
                                        class={['bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500', (action.value?.failed && action.value.fieldErrors?.password) ? 'border-red-300' : 'border-gray-300']} placeholder="••••••••" />
                                    {
                                        action.value?.failed && <p class="mt-2 text-sm text-red-600 dark:text-red-500">{action.value.fieldErrors?.password}</p>
                                    }
                                </div>

                                <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create</button>
                                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Already have an account?
                                    <Link href="/account/signin" class="ml-3 font-medium text-primary-600 hover:underline dark:text-primary-500">Sign in</Link>
                                </p>
                            </Form>

                            {/* {
                                action.value?.failed && <p>{action.value.fieldErrors?.name}</p>
                            }

                            {
                                action.value?.failed && <p>{action.value.fieldErrors?.email}</p>
                            }

                            {
                                action.value?.failed && <p>{action.value.fieldErrors?.password}</p>
                            } */}

                            {/* {
                                action.value?.status === false && <>
                                    <p>{action.value.error?.code}</p>
                                    <p>{action.value.error?.message}</p>
                                    <p>{action.value.error?.type}</p>
                                </>
                            } */}

                            {
                                action.value?.status === false && <>
                                    <div class="flex p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                        <svg aria-hidden="true" class="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                                        <span class="sr-only">Info</span>
                                        <div>
                                            {
                                                action.value.error?.type == 'user_already_exists' ? 'A user with same email already exist.' : ''
                                            }
                                        </div>
                                    </div>
                                </>
                            }

                            {/* {
                                action.value?.status === false && <>
                                    {JSON.stringify(action.value)}
                                </>
                            }

                            {
                                action.value?.status === true && <>
                                    <p>User account created successfully: {action.value?.data?.id}</p>
                                </>
                            }

                            {
                                action.value?.status === true && <>
                                    {JSON.stringify(action.value?.data)}
                                </>
                            } */}

                            {
                                action.value?.status === true && <>
                                    <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                                        Your account has successfully created. Please <span class="font-medium">sign in</span> to your account.
                                    </div>
                                </>
                            }

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
});

export const head: DocumentHead = {
    title: 'Welcome to Lemonlist',
    meta: [
        {
            name: 'description',
            content: 'Qwik site description',
        },
    ],
};
