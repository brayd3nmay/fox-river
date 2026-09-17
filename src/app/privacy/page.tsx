import { getContent } from "@/lib/content";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const metadata = {
  title: "Privacy",
  description:
    "How Fox River Recreation handles the information collected through this website.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
};
export default async function Page() {
  const { contact } = await getContent();
  return (
    <>
      <SiteHeader phone={contact.phone} />
      <main id="main" className="container-wide pb-20">
        <div className="page-intro">
          <p className="eyebrow">Fox River Recreation</p>
          <h1 className="display">Your privacy.</h1>
        </div>
        <div className="max-w-3xl space-y-8 py-12 body-copy">
          <section>
            <h2 className="display text-3xl text-foreground mb-4">
              Browsing the website
            </h2>
            <p>
              You can browse without creating an account. This website does not
              use advertising trackers or analytics cookies. The hosting and
              media services may process technical request information, such as
              IP address and browser details, to deliver the website and
              maintain security.
            </p>
          </section>
          <section>
            <h2 className="display text-3xl text-foreground mb-4">
              Contacting the campground
            </h2>
            <p>
              Phone and email links open your phone or email application.
              Information you send is used to respond to your inquiry or arrange
              your stay. Please contact the office with questions about your
              information.
            </p>
          </section>
          <section>
            <h2 className="display text-3xl text-foreground mb-4">
              Owner sign-in
            </h2>
            <p>
              The private owner editor uses Google sign-in and Supabase
              authentication. Signing in shares your Google account identity and
              email with the authentication service. Essential session cookies
              keep approved owners signed in. Guest Google accounts are not
              needed to browse or reserve by phone.
            </p>
          </section>
          <section>
            <h2 className="display text-3xl text-foreground mb-4">
              External services
            </h2>
            <p>
              Links to Facebook and Google Maps open those services, which have
              their own privacy policies. Their embeds are not loaded on this
              website.
            </p>
          </section>
          <section>
            <h2 className="display text-3xl text-foreground mb-4">Questions</h2>
            <p>
              Email{" "}
              <a href={`mailto:${contact.email}`} className="underline">
                {contact.email}
              </a>{" "}
              or call {contact.phone}.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter contact={contact} />
    </>
  );
}
