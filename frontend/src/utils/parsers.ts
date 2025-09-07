import Papa from "papaparse";
import * as pdfjsLib from "pdfjs-dist";
import type {
	TextContent,
	TextItem,
	TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";
import * as XLSX from "xlsx";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ----- CSV -----
export type CSVRow = Record<string, string>;

export async function parseCSV(file: File): Promise<CSVRow[]> {
	return new Promise((resolve, reject) => {
		Papa.parse<CSVRow>(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => resolve(results.data),
			error: (err) => reject(err),
		});
	});
}

// ----- PDF -----
function isTextItem(x: TextItem | TextMarkedContent): x is TextItem {
	return (x as TextItem).str !== undefined;
}

export async function parsePDF(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

	let text = "";
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content: TextContent = await page.getTextContent();
		const line = content.items
			.filter(isTextItem)
			.map((item) => item.str)
			.join(" ");
		text += line + "\n";
	}
	return text.trim();
}

// ----- Excel (XLSX) -----
export type ExcelRow = Record<string, unknown>;

export async function parseExcel<T extends ExcelRow = ExcelRow>(
	file: File
): Promise<T[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e: ProgressEvent<FileReader>) => {
			const result = e.target?.result;
			if (!(result instanceof ArrayBuffer)) {
				reject(new Error("Failed to read file as ArrayBuffer"));
				return;
			}
			const data = new Uint8Array(result);
			const workbook = XLSX.read(data, { type: "array" });

			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			if (!worksheet) {
				reject(new Error("No worksheet found in workbook"));
				return;
			}

			const json = XLSX.utils.sheet_to_json<T>(worksheet, { defval: null });
			resolve(json);
		};

		reader.onerror = () => reject(reader.error ?? new Error("File read error"));
		reader.readAsArrayBuffer(file);
	});
}
