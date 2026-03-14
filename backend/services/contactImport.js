const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { parse } = require("csv-parse/sync");

const { bulkUpsertContacts } = require("../db/contacts");
const { normalizePhone } = require("../utils/phone");

function mapRow(row) {
  const name = row.name ?? row.Name ?? row.NAME ?? "";
  const phone = row.phone ?? row.Phone ?? row.PHONE ?? "";
  const company = row.company ?? row.Company ?? row.COMPANY ?? "";
  const notes = row.notes ?? row.Notes ?? row.NOTES ?? "";

  return {
    name: String(name || "").trim(),
    phone: normalizePhone(phone),
    company: String(company || "").trim(),
    notes: String(notes || "").trim(),
  };
}

function parseCsv(buffer) {
  const text = buffer.toString("utf8");
  return parse(text, { columns: true, skip_empty_lines: true, trim: true });
}

function parseXlsx(filePath) {
  const workbook = xlsx.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
}

async function importContactsFromUpload(upload, ownerUserId) {
  const ext = path.extname(upload.originalname || "").toLowerCase();
  const filePath = upload.path;

  let rows;
  if (ext === ".csv") {
    const buffer = fs.readFileSync(filePath);
    rows = parseCsv(buffer);
  } else if (ext === ".xlsx" || ext === ".xls") {
    rows = parseXlsx(filePath);
  } else {
    const err = new Error("Unsupported file type. Upload CSV or Excel.");
    err.code = "UNSUPPORTED_FILE";
    throw err;
  }

  const mapped = rows.map(mapRow).filter((r) => r.phone);
  const uniqueByPhone = new Map();
  for (const r of mapped) uniqueByPhone.set(r.phone, r);

  const rowsToUpsert = Array.from(uniqueByPhone.values());
  if (!rowsToUpsert.length) {
    return { imported: 0, updated: 0, total: 0 };
  }
  return bulkUpsertContacts({ ownerUserId, rows: rowsToUpsert });
}

module.exports = { importContactsFromUpload };
