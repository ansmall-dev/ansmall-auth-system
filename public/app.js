const out = document.getElementById("out");
function show(data, isError) {
  out.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  out.className = isError ? "err" : "";
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = text;
  }
  if (!res.ok) {
    show(body, true);
    throw new Error(res.statusText);
  }
  show(body, false);
  return body;
}

document.getElementById("btnRegister").onclick = () => {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  api("/api/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).catch(() => {});
};

document.getElementById("btnLogin").onclick = () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  api("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).catch(() => {});
};

document.getElementById("btnMe").onclick = () => {
  api("/api/me").catch(() => {});
};

document.getElementById("btnLogout").onclick = () => {
  api("/api/logout", { method: "POST" }).catch(() => {});
};
