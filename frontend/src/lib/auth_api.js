import { apiRequest } from "./api";

function normalizeActorType(actorType) {
  return actorType === "employee" ? "employee" : "customer";
}

function normalizeRole(role, actorType) {
  if (actorType === "employee") {
    return role === "admin" ? "admin" : "regular";
  }

  return "customer";
}

export function normalizeAuthUser(rawUser) {
  const actorType = normalizeActorType(rawUser?.actor_type);

  return {
    id: String(rawUser?.id ?? ""),
    actorType,
    role: normalizeRole(rawUser?.role, actorType),
    firstName: rawUser?.first_name ?? "",
    lastName: rawUser?.last_name ?? "",
    email: rawUser?.email ?? null,
    address: rawUser?.address ?? null,
    hid: rawUser?.hid ?? null,
  };
}

export async function loginCustomer(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function registerCustomer(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function loginEmployee(payload) {
  return apiRequest("/employee/login", {
    method: "POST",
    body: payload,
  });
}

export async function getCurrentUser(token, signal) {
  const response = await apiRequest("/auth/me", {
    token,
    signal,
  });

  return normalizeAuthUser(response);
}

