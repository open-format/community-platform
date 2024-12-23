"use server";

import config from "@/constants/config";
import { ThirdwebStorage } from "@thirdweb-dev/storage";

const storage = new ThirdwebStorage({
  secretKey: config.THIRDWEB_SECRET, // You can get one from dashboard settings
});

export async function uploadMetadata(metadata: { [key: string]: string }) {
  const ipfsHash = await storage.upload(metadata, { uploadWithoutDirectory: true });
  return ipfsHash;
}

export async function uploadFileToIPFS(formData: FormData) {
  const file = formData.get("file") as File;

  // Convert the file to a Buffer
  const buffer = await file.arrayBuffer(); // Convert file to ArrayBuffer
  const fileBuffer = Buffer.from(buffer); // Convert ArrayBuffer to Buffer

  const ipfsHash = await storage.upload(fileBuffer, {
    uploadWithoutDirectory: true,
  });

  return ipfsHash;
}

export async function getMetadata(ipfsHash: string) {
  const metadata = await storage.downloadJSON(ipfsHash);

  if (metadata.image) {
    const image = await storage.download(metadata.image);
    metadata.image = image.url;
  }

  return metadata;
}
