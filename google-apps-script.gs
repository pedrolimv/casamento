const SHEET_NAME = "Convidados";
const SECRET_TOKEN = "PRETOEBRANCOCOMBINA";

const HEADERS = [
  "Recebido em",
  "Nome",
  "Telefone",
  "Adultos",
  "Crianças",
  "Presença",
  "Observações",
  "Origem"
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");

    if (SECRET_TOKEN && payload.token !== SECRET_TOKEN) {
      return jsonResponse({ ok: false, error: "Token inválido" });
    }

    const sheet = getSheet();
    sheet.appendRow([
      new Date(),
      payload.nome || "",
      payload.telefone || "",
      payload.adultos || "",
      payload.criancas || "",
      payload.presenca || "",
      payload.observacoes || "",
      payload.origem || ""
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function doGet(e) {
  if (SECRET_TOKEN && (!e.parameter || e.parameter.token !== SECRET_TOKEN)) {
    return jsonResponse({ ok: false, error: "Token inválido" });
  }

  const rows = getSheet().getDataRange().getValues();
  const headers = rows.shift() || [];
  const guests = rows.map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });

  return jsonResponse({ ok: true, guests });
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const missingHeaders = HEADERS.some((header, index) => firstRow[index] !== header);

  if (missingHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
