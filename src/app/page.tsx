import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Video } from "@/components/video";
import { cn } from "@/lib/utils";
import Link from "next/link";

const sections = [
  {
    title: "Beautiful Community Profiles",
    description: "Engage new members with a easy to use UX, showing leaderboard, badges and activity.",
    videoUrl: "/videos/platform-beautiful-community-profile.mp4", // Replace with actual video URL
    comingSoon: false,
  },
  {
    title: "Reward Users in Seconds",
    description:
      "Easily create onchain tokens and badges. No more waiting for your dev team. No more waiting for your users to get their rewards.",
    videoUrl: "/videos/platform-manual-rewards.mp4", // Replace with actual video URL
    comingSoon: false,
  },
  {
    title: "Snapshot of Top Members",
    description: "Quickly identify and reward your most active contributors.",
    videoUrl: "/videos/platform-leaderboard.mp4", // Replace with actual video URL
    comingSoon: false,
  },
  {
    title: "Let Your Agent Work",
    description: "Relax as your automated agent handles community management tasks.",
    videoUrl: "/videos/platform-ai-future.mp4", // Replace with actual video URL
    comingSoon: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="bg-cover bg-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/279.jpg')", opacity: 0.1 }}
        ></div>
        <section className="relative flex flex-col bg-white/30 items-center justify-center gap-6 px-4 py-24 bg-cover bg-center max-w-prose mx-auto">
          <div className="text-center">
            <h1 className="text-7xl font-bold tracking-tighter">The platform for decentralised communities.</h1>
            <p className="mt-4 text-xl">Onboard, manage and reward your community from any app.</p>
          </div>
          <div className="flex gap-4">
            <Link className={cn(buttonVariants({ size: "lg" }), "rounded-full text-xl")} href="/auth">
              Get started
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full text-xl")}
              href="/auth"
            >
              View demo
            </Link>
          </div>
        </section>
      </div>
      <div className="max-w-prose mx-auto">
        <section className="flex flex-col gap-24 mt-6">
          {sections.map((section, index) => (
            <Section
              key={index}
              title={section.title}
              description={section.description}
              videoUrl={section.videoUrl}
              comingSoon={section.comingSoon}
            />
          ))}
        </section>
      </div>
      <div className="bg-cover bg-center relative pb-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/279.jpg')", opacity: 0.1 }}
        ></div>
        <div className="relative flex flex-col bg-white/30 text-center items-center justify-center gap-6 px-4 py-24 bg-cover bg-center max-w-prose mx-auto">
          <h2 className="text-5xl font-bold tracking-tighter">What are you waiting for?</h2>
          <p>Supercharge your community today.</p>
          <Link className={cn(buttonVariants({ size: "lg" }), "rounded-full text-xl")} href="/auth">
            Get started
          </Link>
        </div>
        <footer className="flex flex-col gap-4 text-center">
          <p>
            Built with ❤️ by the team at <Link href="https://www.chainstack.com">Open Format</Link>
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  videoUrl,
  comingSoon,
}: {
  title: string;
  description: string;
  videoUrl: string;
  comingSoon: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">{title}</h2>
        {comingSoon && <Badge className="rounded-full">Coming soon</Badge>}
      </div>
      <p className="mt-2 text-lg">{description}</p>
      <Video video={videoUrl} />
    </div>
  );
}
