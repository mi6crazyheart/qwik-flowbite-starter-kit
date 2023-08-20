import { component$, Slot } from "@builder.io/qwik";
import AuthenticatedNav from "~/components/authenticated-nav";
import AuthenticatedSidebar from "~/components/authenticated-sidebar";

export default component$(() => {
  return (
    <>
      <div class="antialiased bg-gray-50 dark:bg-gray-900">
        <AuthenticatedNav />
        <AuthenticatedSidebar />
        <Slot />
      </div>
    </>
  );
});
