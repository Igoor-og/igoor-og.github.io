/* ==========================================================
   HD Barbearia — store/clients.js
   Armazenamento global de clientes (fonte única da verdade).
   Consumido pela Gestão (raio-x de clientes), pelo Novo
   Atendimento (dropdown de busca) e pelo cadastro de clientes.
   ========================================================== */

"use strict";

/* Lista mestre — união dos dados de gestão e de atendimento. */
const CLIENTS = [
  { name: "Pedro Almeida", phone: "5511999990008", email: "", notes: "", status: "recorrente", frequent: true },
  { name: "João Mendes", phone: "5511999990009", email: "", notes: "", status: "novo", frequent: false },
  { name: "Lucas Ferreira", phone: "5511999990005", email: "", notes: "", status: "recorrente", frequent: true },
  { name: "Rafael Costa", phone: "5511999990010", email: "", notes: "", status: "novo", frequent: false },
  { name: "Bruno Souza", phone: "5511999990002", email: "", notes: "", status: "recorrente", frequent: true },
  { name: "Felipe Lima", phone: "5511999990011", email: "", notes: "", status: "novo", frequent: false },
  { name: "Gustavo Rocha", phone: "5511999990012", email: "", notes: "", status: "novo", frequent: false },
  { name: "Thiago Nunes", phone: "5511999990013", email: "", notes: "", status: "novo", frequent: false },
  { name: "Rafael Lima", phone: "5511999990001", email: "", notes: "", status: "recorrente", frequent: true },
  { name: "Diego Martins", phone: "5511999990003", email: "", notes: "", status: "novo", frequent: false },
  { name: "André Santos", phone: "5511999990004", email: "", notes: "", status: "novo", frequent: false },
  { name: "Tiago Mendes", phone: "5511999990006", email: "", notes: "", status: "sumido", frequent: false },
  { name: "Caio Rocha", phone: "5511999990007", email: "", notes: "", status: "sumido", frequent: false },
];

export function getClients() {
  return CLIENTS;
}

export function clientInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function isFrequent(name) {
  const client = CLIENTS.find((c) => c.name === name);
  return Boolean(client && (client.frequent || client.status === "recorrente"));
}

export function addClient({ name, phone, email, notes }) {
  const clean = {
    name: String(name || "").trim(),
    phone: String(phone || "").replace(/\D/g, ""),
    email: String(email || "").trim(),
    notes: String(notes || "").trim(),
  };

  const existing = CLIENTS.find(
    (c) => c.name.toLowerCase() === clean.name.toLowerCase()
  );
  if (existing) {
    if (clean.phone) existing.phone = clean.phone;
    if (clean.email) existing.email = clean.email;
    if (clean.notes) existing.notes = clean.notes;
    return existing;
  }

  const client = {
    name: clean.name,
    phone: clean.phone,
    email: clean.email,
    notes: clean.notes,
    status: "novo",
    frequent: false,
  };
  CLIENTS.push(client);
  return client;
}