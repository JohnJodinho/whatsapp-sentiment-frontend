import JSZip from "jszip";
import { isWhatsAppExport } from "./whatsappUtils";

const MAX_ZIP_SIZE_BYTES = 20 * 1024 * 1024; // 20MB


export async function extractChatTxtFromZip(file: File): Promise<File> {
  if (file.size > MAX_ZIP_SIZE_BYTES) {
    throw new Error("ZIP file is too large. Maximum size is 20MB.");
  }

  try {
    const zip = await JSZip.loadAsync(file);
    const txtFileNames = Object.keys(zip.files).filter((name) =>
      name.toLowerCase().endsWith(".txt") && !zip.files[name].dir
    );

    if (txtFileNames.length === 0) {
      throw new Error("No .txt files found in the ZIP archive.");
    }

   
    for (const name of txtFileNames) {
      const content = await zip.file(name)?.async("string");
      if (content) {
        
        const fileFromZip = new File([content], name, { type: "text/plain" });
        if (await isWhatsAppExport(fileFromZip)) {
        
          const renamedFile = new File(
            [content],
            `${file.name.replace(/\.zip$/i, ".txt")}`,
            { type: "text/plain" }
          );
          return renamedFile;
        }
      }
    }

    throw new Error("No valid WhatsApp chat file found in the ZIP archive.");
  } catch (err) {
    console.error("ZIP extraction error:", err);
    if (err instanceof Error && err.message.startsWith("No")) {
      throw err;
    }
    throw new Error("Failed to process ZIP file. It may be corrupted.");
  }
}