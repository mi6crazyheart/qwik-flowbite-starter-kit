import { $, component$, useTask$ } from "@builder.io/qwik";
import { routeLoader$, z, RequestEvent } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, useNavigate, routeAction$ } from "@builder.io/qwik-city";
import type { InitialValues, SubmitHandler } from "@modular-forms/qwik";
import { formAction$, useForm, zodForm$ } from "@modular-forms/qwik";
// import { account } from "~/appwrite.config";
// import { type RequestHandler } from "@builder.io/qwik-city";
import * as setCookie from "set-cookie-parser";
import {
  AppwriteEndpoint,
  AppwriteHostname,
  AppwriteProject,
  SsrHostname,
  AppwriteService,
} from "~/AppwriteService";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email.")
    .email("The email address is badly formatted."),
  password: z
    .string()
    .min(1, "Please enter your password.")
    .min(8, "You password must have 8 characters or more."),
});

type LoginForm = z.infer<typeof loginSchema>;

export const useFormLoader = routeLoader$<InitialValues<LoginForm>>(() => ({
  email: "",
  password: "",
}));

export const useFormAction = formAction$<LoginForm>(
  async (values, requestEvent) => {
    console.log("On Server...");

    try {
      const response = await fetch(
        `${AppwriteEndpoint}/account/sessions/email`,
        {
          method: "POST",
          headers: {
            "x-appwrite-project": AppwriteProject,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        }
      );

      const json = await response.json();
      console.log("email session json data: ", json);

      if (json.code >= 400) {
        console.log("Exception Caught1: ", json.message);
        requestEvent.json(400, { mesages: json.message });
        return;
      }

      const ssrHostname =
        SsrHostname === "localhost" ? SsrHostname : "." + SsrHostname;
      const appwriteHostname =
        AppwriteHostname === "localhost"
          ? AppwriteHostname
          : "." + AppwriteHostname;

      const cookiesStr = (response.headers.get("set-cookie") ?? "")
        .split(appwriteHostname)
        .join(ssrHostname);

      const cookiesArray = setCookie.splitCookiesString(cookiesStr);
      const cookiesParsed = cookiesArray.map((cookie: any) =>
        setCookie.parseString(cookie)
      );

      for (const cookie of cookiesParsed) {
        requestEvent.cookie.set(cookie.name, cookie.value, {
          domain: cookie.domain,
          secure: cookie.secure,
          sameSite: cookie.sameSite as any,
          path: cookie.path,
          maxAge: cookie.maxAge,
          httpOnly: cookie.httpOnly,
          expires: cookie.expires,
        });
      }

      console.log("email session created: ", requestEvent);
      requestEvent.json(200, json);

      // return requestEvent;
    } catch (err: any) {
      console.log("Exception Caught2: ", err.message);
      requestEvent.json(400, { mesages: err.message });

      // return requestEvent;
    }
  },
  zodForm$(loginSchema)
);

export const useAccountLoader = routeLoader$(async ({ cookie }) => {
  const sessionNames = [
    "a_session_" + AppwriteProject.toLowerCase(),
    "a_session_" + AppwriteProject.toLowerCase() + "_legacy",
  ];

  const hash =
    cookie.get(sessionNames[0])?.value ??
    cookie.get(sessionNames[1])?.value ??
    "";

  AppwriteService.setSession(hash);

  // let account;
  // try {
  //   account = await AppwriteService.getAccount();
  // } catch (err) {
  //   console.log(err);
  //   account = null;
  // }

  // Neccessary fix row now, until "XMLHttpRequest is not defined" is fixed
  const authCookies: any = {};
  authCookies["a_session_" + AppwriteProject] = hash;
  let account;
  try {
    const response = await fetch(`${AppwriteEndpoint}/account`, {
      method: "GET",
      headers: {
        "x-appwrite-project": AppwriteProject,
        "x-fallback-cookies": JSON.stringify(authCookies),
      },
    });

    if (response.status >= 400) {
      throw new Error(await response.text());
    }

    account = await response.json();
  } catch (err) {
    console.log(err);
    account = null;
  }

  return {
    account,
  };
});

// const navigationToPage = (nav: any, pageRoute: string) => {
//   $(nav(pageRoute));
// };

export default component$(() => {
  const [loginForm, { Form, Field }] = useForm<LoginForm>({
    loader: useFormLoader(),
    action: useFormAction(),
    validate: zodForm$(loginSchema),
  });

  const nav = useNavigate();

  console.log("loginForm Result: ", loginForm);

  const account = useAccountLoader();
  console.log("user account info1: ", account);
  console.log("user account info2: ", account.value);
  console.log("user account info3: ", account.value?.account?.$id);

  let sid: string = "";
  if (account.value?.account?.$id) {
    sid = account.value.account.$id;
  }
  console.log("sid: ", sid);

  useTask$(({ track }) => {
    track(() => sid);

    if (sid != "") {
      nav("/dashboard");
    }
  });

  // if (sid != "") {
  //   navigationToPage(nav, "/dashboard");
  // }

  type signinFormData = {
    email: string;
    password: string;
  };

  const handleSubmit: SubmitHandler<LoginForm> = $(
    (values: signinFormData, event) => {
      // Runs on client
      console.log("Form data in client side: ", values);
    }
  );

  return (
    <>
      <section class="bg-gray-50 dark:bg-gray-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="#"
            class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            <img
              class="w-8 h-8 mr-2"
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
              alt="logo"
            />
            Lemonlist
          </a>
          <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign in to your account
              </h1>
              <Form class="space-y-4 md:space-y-6" onSubmit$={handleSubmit}>
                <Field name="email">
                  {(field, props) => (
                    <div>
                      <label
                        for="email"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your email
                      </label>
                      <input
                        {...props}
                        type="email"
                        value={field.value}
                        class={[
                          "bg-gray-50 border  text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                          field.error ? "border-red-300" : "border-gray-300",
                        ]}
                        placeholder="name@company.com"
                      />

                      {field.error && (
                        <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                          {field.error}
                        </p>
                      )}
                    </div>
                  )}
                </Field>

                <Field name="password">
                  {(field, props) => (
                    <div>
                      <label
                        for="password"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Password
                      </label>
                      <input
                        {...props}
                        type="password"
                        value={field.value}
                        placeholder="••••••••"
                        class={[
                          "bg-gray-50 border text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                          field.error ? "border-red-300" : "border-gray-300",
                        ]}
                      />

                      {field.error && (
                        <p class="mt-2 text-sm text-red-600 dark:text-red-500">
                          {field.error}
                        </p>
                      )}
                    </div>
                  )}
                </Field>

                <div class="flex items-center justify-between">
                  <div class="flex items-start">
                    {/* <div class="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      />
                    </div>
                    <div class="ml-3 text-sm">
                      <label
                        for="remember"
                        class="text-gray-500 dark:text-gray-300"
                      >
                        Remember me
                      </label>
                    </div> */}
                  </div>
                  <a
                    href="#"
                    class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Sign in
                </button>
                <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                  Don’t have an account yet?
                  <Link
                    href="/account/signup"
                    class="ml-3 font-medium text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Sign up
                  </Link>
                </p>
              </Form>
              {JSON.stringify(loginForm.response)}

              {loginForm.response.status === false &&
                (loginForm.response.data.error.type ===
                  "general_rate_limit_exceeded" ||
                  loginForm.response.data.error.type ===
                    "user_invalid_credentials") && (
                  <>
                    <div
                      class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                      role="alert"
                    >
                      {loginForm.response.data.error.message}
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Lemonlist",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
