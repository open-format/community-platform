import { useTranslations } from "next-intl";
import { PrivyLogin } from "./PrivyLogin";

export default function Auth() {
  const t = useTranslations("auth");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <div className="flex flex-col justify-between items-start w-full md:w-1/2 px-10 py-24 bg-zinc-900 border-r border-zinc-800 min-h-screen space-y-6">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold">
              Spin up your <span className="text-primary">Community Copilot</span> in minutes
            </h1>
          </div>

          <div className="mb-8 w-full">
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span> Spot the people actually helping
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span> Get daily reward recommendations based on
                activity in your community
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span> Receive a weekly impact report of
                community wins and blockers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span> Reward your community in one click
              </li>
            </ul>
          </div>

          <blockquote className="text-gray-400">
            "This will save me 2 days per week!" - Marco Dinis Santos - Community Manager @ Aurora
          </blockquote>
        </div>
        <div className="w-full space-y-4">
          <h2>Join other communities using our platform</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 place-items-center">
            <img src="/images/partners/matchain.avif" alt="Matchain" className="h-8" />
            <img src="/images/partners/aurora.png" alt="Aurora" className="h-8" />
            <img src="/images/partners/turbo.avif" alt="Turbo" className="h-8" />
            <img src="/images/partners/amplify.avif" alt="Amplify" className="h-8" />
            <img src="/images/partners/dovu.avif" alt="Dovu" className="h-8" />
          </div>
        </div>
      </div>

      <PrivyLogin />
    </div>
  );
}
