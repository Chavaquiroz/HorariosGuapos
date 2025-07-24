import * as pdfjsLib from "pdfjs-dist";


//La puta madre, el worker del pdf no jalaba pero ya lo hace, todo pq se diriga al url desde el local host
//Tambien es necesaria la version 3.7.107 y no la mas reciente
//Asi que usa: npm install pdfjs-dist@3.7.107
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js";
}

export async function extractPdfText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async function (event) {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) return reject("Archivo vacío");

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const text = content.items.map((item: any) => (item as any).str).join(" ");
          fullText += `Página ${i}:\n${text}\n\n`;
        }

        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}