import Chat from "@/components/chat";
import DocumentUploadForm from "@/forms/document-upload-form";
import { getTranslations } from "next-intl/server";

export default async function Agents({ params }: { params: Promise<{ slug: string }> }) {
  const t = getTranslations("agents");
  const slug = (await params).slug as `0x${string}`;

  return (
    <div className="grid grid-cols-5 gap-4 p-12 h-screen">
      {/* File Upload Section */}
      <div className="col-span-2">
        <DocumentUploadForm communitySlug={slug} />
      </div>

      {/* Chat Section */}
      <div className="col-span-3">
        <Chat communitySlug={slug} />
      </div>
    </div>
  );
}
