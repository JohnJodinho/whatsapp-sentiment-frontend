/**
 * A client-side heuristic to quickly check if a file appears to be a WhatsApp text export.
 * Reads the first ~2KB of text and checks for Android/iOS WhatsApp message patterns.
 */
export const isWhatsAppExport = (file: File | Blob): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const slice = file.slice(0, 2048); // Read first 2KB for better accuracy

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        resolve(false);
        return;
      }

      // Regex for Android messages: e.g. "27/05/21, 7:28 PM - Alice: Hello"
      const androidRegex = new RegExp(
        String.raw`^\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APMapm]{2})?\s-\s`,
        "m"
      );

      // Regex for iOS messages: e.g. "[01/13/24, 12:24:48 AM] Alex: Hello"
      const iosRegex = new RegExp(
        String.raw`^\[\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APMapm]{2})?\]`,
        "m"
      );

      // Encryption/system messages that often appear at top
      const systemRegex = /(Messages to this chat are now secured|Messages are end-to-end encrypted)/i;

      // Check if any match exists
      const isValid =
        androidRegex.test(text) ||
        iosRegex.test(text) ||
        systemRegex.test(text);

      resolve(isValid);
    };

    reader.onerror = () => resolve(false);
    reader.readAsText(slice);
  });
};
