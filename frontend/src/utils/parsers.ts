import Papa from "papaparse";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parseCSV(file: File): Promise<any[]> {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			complete: (results) => resolve(results.data),
			error: reject,
		});
	});
}

export async function parsePDF(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
	let text = "";

	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		text += content.items.map((item: any) => item.str).join(" ") + "\n";
	}

	return text;
}

export async function parseExcel(file: File): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: "array" });
			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const json = XLSX.utils.sheet_to_json(worksheet);
			resolve(json);
		};
		reader.onerror = reject;
		reader.readAsArrayBuffer(file);
	});
}
