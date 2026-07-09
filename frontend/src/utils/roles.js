const ADMIN_EMAILS = [
  "rizubanerjee456@gmail.com",
];

export function getUserEmail() {
  return localStorage.getItem("user_email") || "";
}

export function isAdmin() {
  // The backend is the source of truth. After login, /auth/me stores the
  // is_admin flag. Fall back to a hardcoded email list only for the brief
  // window before that handshake completes.
  const storedFlag = localStorage.getItem("is_admin");
  if (storedFlag === "true") return true;
  if (storedFlag === "false") return false;

  const email = getUserEmail().toLowerCase().trim();
  if (!email) return false;
  return ADMIN_EMAILS.some(
    (admin) => admin.toLowerCase() === email
  );
}

export function isAuthenticated() {
  return !!localStorage.getItem("firebase_token");
}

export function getUserName() {
  return localStorage.getItem("user_name") || "";
}

export function getUserPhoto() {
  return localStorage.getItem("user_photo") || "";
}
