import Authentication from "@/components/authentication";

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Authentication />
    </div>
  );
}
