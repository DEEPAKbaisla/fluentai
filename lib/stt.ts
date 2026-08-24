export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append(
    "audio",
    new File([blob], "speech.webm", { type: blob.type || "audio/webm" })
  );

  const res = await fetch("/api/stt", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Transcription failed");
  return (data.text || "").trim();
}
