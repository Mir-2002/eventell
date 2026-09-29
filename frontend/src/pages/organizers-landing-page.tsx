import BackgroundBlobs from "@/components/background-blobs";
import FaqAccordion, { FaqItem } from "@/components/faq-accordion";
import NavBar from "@/components/nav-bar";
import Reveal from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, QrCode, Ticket } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate } from "react-router";

const features = [
  {
    title: "Create an event in minutes",
    body: "Add a venue, dates and as many ticket types as you need. Save it as a draft and publish when you're ready.",
  },
  {
    title: "Sell tickets without the fuss",
    body: "Attendees find your event, pick a ticket and get a QR code straight away. Caps stop you overselling.",
  },
  {
    title: "Check people in at the door",
    body: "Your staff scan tickets with any phone camera, or type the ticket id in. Each ticket only works once.",
  },
];

// Placeholder copy until real organizer quotes are collected
const testimonials = [
  {
    quote:
      "Placeholder quote. A real organizer's words about running their event on Eventell will go here.",
    name: "Organizer name",
  },
  {
    quote:
      "Placeholder quote. Swap this for genuine feedback once the first events have run.",
    name: "Organizer name",
  },
];

const faqs: FaqItem[] = [
  {
    question: "How much does Eventell cost?",
    answer:
      "Eventell is a demo project, so there are no fees and no real payments are taken.",
  },
  {
    question: "Can I edit an event after publishing it?",
    answer:
      "Yes. You can change the details, add or remove ticket types, or move the event back to draft at any time from your dashboard.",
  },
  {
    question: "How do my staff validate tickets?",
    answer:
      "Staff accounts get a validation screen that uses the phone camera to scan QR codes. They can also enter a ticket id by hand if a code won't scan.",
  },
  {
    question: "Can I limit how many tickets are sold?",
    answer:
      "Each ticket type can have its own total. Once it's reached, the ticket type shows as sold out.",
  },
];

interface PhoneProperties {
  className?: string;
  screenClassName?: string;
  children: ReactNode;
}

const Phone: React.FC<PhoneProperties> = ({
  className,
  screenClassName,
  children,
}) => (
  <div
    aria-hidden
    className={cn(
      "shrink-0 rounded-[3rem] border border-stone-200 bg-white p-2.5 shadow-soft",
      className,
    )}
  >
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[2.5rem] px-5 pt-8 pb-6",
        screenClassName,
      )}
    >
      <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-stone-200" />
      {children}
    </div>
  </div>
);

const OrganizersLandingPage: React.FC = () => {
  const { isAuthenticated, signinRedirect } = useAuth();
  const navigate = useNavigate();

  const startSelling = () => {
    if (isAuthenticated) {
      navigate("/dashboard/events/create");
    } else {
      localStorage.setItem("redirectPath", "/dashboard/events/create");
      signinRedirect();
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden pb-16">
      <NavBar />

      {/* Hero */}
      <section className="relative isolate px-4 pt-20 pb-16 text-center md:pt-28 md:pb-24">
        <BackgroundBlobs />
        <div className="mx-auto max-w-3xl motion-safe:animate-reveal">
          <h1 className="text-5xl font-medium tracking-tight text-ink md:text-7xl">
            Sell out your next{" "}
            <span className="font-accent text-6xl text-coral md:text-8xl">
              gathering
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[500px] text-lg text-muted-foreground">
            Create events, sell tickets and check guests in with QR codes, all
            from one calm little dashboard.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="h-12 cursor-pointer px-8"
              onClick={startSelling}
            >
              Create an event
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link to="/">Browse events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="px-4 pb-20 md:pb-28">
        <Reveal className="mx-auto flex max-w-5xl items-start justify-center">
          <Phone
            className="-mr-6 mt-12 hidden h-[580px] w-[280px] opacity-80 lg:block"
            screenClassName="bg-sage"
          >
            <p className="text-sm text-muted-foreground">Your events</p>
            <p className="mt-1 text-2xl font-medium tracking-tight">3 live</p>
            <div className="mt-6 flex flex-col gap-3">
              {["Rooftop jazz", "Pottery evening", "Book swap"].map((name) => (
                <div key={name} className="rounded-2xl bg-white p-4">
                  <p className="font-medium">{name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Published
                  </p>
                </div>
              ))}
            </div>
          </Phone>

          <Phone
            className="relative z-10 h-[620px] w-[300px] max-w-full"
            screenClassName="bg-background"
          >
            <p className="text-sm text-muted-foreground">Validate ticket</p>
            <div className="mt-4 flex aspect-square items-center justify-center rounded-3xl bg-stone-100">
              <QrCode className="size-24 text-stone-400" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-2 rounded-3xl bg-success-soft p-5 text-success">
              <span className="flex size-10 items-center justify-center rounded-full bg-white">
                <Check className="size-5" />
              </span>
              <p className="text-xl font-medium">Valid ticket</p>
              <p className="text-xs">General admission</p>
            </div>
            <div className="mt-auto flex h-11 items-center justify-center rounded-full bg-ink text-sm font-medium text-white">
              Scan next
            </div>
          </Phone>

          <Phone
            className="-ml-6 mt-24 hidden h-[580px] w-[280px] opacity-80 lg:block"
            screenClassName="bg-lavender"
          >
            <p className="text-sm text-muted-foreground">Ticket types</p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                ["Early bird", "$15"],
                ["General", "$25"],
                ["Supporter", "$40"],
              ].map(([name, price]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-2xl bg-white p-4"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Ticket className="size-4 text-muted-foreground" />
                    {name}
                  </span>
                  <span className="text-sm">{price}</span>
                </div>
              ))}
            </div>
          </Phone>
        </Reveal>
      </section>

      {/* Features */}
      <section className="px-4 pb-20 md:pb-28">
        <Reveal className="mx-auto max-w-5xl">
          <h2 className="max-w-xl text-4xl font-medium tracking-tight md:text-5xl">
            Everything an evening needs, nothing it doesn't
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={cn(
                  "rounded-[2rem] p-8",
                  ["bg-sage", "bg-lavender", "bg-blob-rose"][index],
                )}
              >
                <h3 className="text-xl font-medium tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Testimonials */}
      <section className="px-4 pb-20 md:pb-28">
        <Reveal className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-medium tracking-tight md:text-5xl">
            Notes from organizers
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Placeholder notes, real quotes coming soon.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <figure
                key={index}
                className={cn(
                  "rounded-[2rem] bg-white p-8 shadow-soft",
                  index % 2 === 0 ? "-rotate-1" : "rotate-1",
                )}
              >
                <blockquote className="text-lg">{testimonial.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-stone-300" />
                  <span className="font-accent text-2xl text-stone-500">
                    {testimonial.name}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Conversion */}
      <section className="relative isolate overflow-hidden px-4 py-20 text-center md:py-28">
        <BackgroundBlobs />
        <Reveal className="mx-auto max-w-xl">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ink">
            <span className="size-3 rounded-full bg-coral" />
          </span>
          <h2 className="mt-8 text-4xl font-medium tracking-tight md:text-5xl">
            Ready when you are
          </h2>
          <p className="mt-4 text-muted-foreground">
            Set up your first event today. It stays a draft until you choose to
            publish it.
          </p>
          <Button
            variant="dark"
            size="lg"
            className="mt-8 h-12 cursor-pointer px-8"
            onClick={startSelling}
          >
            Start selling tickets
          </Button>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="px-4 pt-8">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-4xl font-medium tracking-tight md:text-5xl">
            Questions, answered
          </h2>
          <FaqAccordion items={faqs} />
        </Reveal>
      </section>
    </div>
  );
};

export default OrganizersLandingPage;
