import { useTranslations } from "next-intl";
import { PrivyLogin } from "./PrivyLogin";

export default function Auth() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Left: Static content - server rendered */}
      <div className="flex flex-col justify-center items-start w-full md:w-1/2 px-10 py-16 bg-zinc-900 border-r border-zinc-800 min-h-screen">
        <h2 className="text-3xl font-bold mb-2">Create an account</h2>
        <p className="text-gray-400 mb-8">Get started with Open Format</p>
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-4">Your onboarding journey</h3>
          <ol className="space-y-2 text-gray-300">
            <li>
              <span className="font-bold text-white mr-2">1</span> Create an account
            </li>
            <li>
              <span className="font-bold text-white mr-2">2</span> Connect to your community
            </li>
            <li>
              <span className="font-bold text-white mr-2">3</span> Deploy the agent to your server
            </li>
            <li>
              <span className="font-bold text-white mr-2">4</span> Access your community dashboard
            </li>
          </ol>
        </div>
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-4">Why Open Format?</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span> Track and reward valuable contributions
              across your community
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span> AI-powered agent analyzes engagement and
              identifies top contributors
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span> Gain actionable insights to help grow your
              community
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span> Seamlessly integrate with Discord, GitHub,
              Telegram and more
            </li>
          </ul>
        </div>
      </div>

      {/* Right: Client component for Privy login */}
      <PrivyLogin />
    </div>
  );
}
