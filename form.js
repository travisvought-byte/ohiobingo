import { createFormStore, FORM_ERROR, otherValue } from "/js/wix/form-store.js";

var OTHER = "__other__";
var formEl = document.getElementById("claim-form");
var store = createFormStore({ formId: formEl.getAttribute("data-form-id") });
var statusEl = document.getElementById("claim-status");
var built = false;
var byTarget = {};

function esc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function inputType(control) {
  if (control === "email" || control === "url" || control === "number") return control;
  if (control === "phone") return "tel";
  return "text";
}
function plain(v) { return typeof v === "string" ? v : ""; }

function fieldHtml(f) {
  var id = "f-" + f.target;
  var req = f.required ? " <span aria-hidden=\"true\">*</span>" : "";
  var html = "<div class=\"field\" data-target=\"" + esc(f.target) + "\">";
  var help = plain(f.description) || (f.control === "file" ? plain(f.explanationText) : "");
  if (f.control === "checkboxGroup" || f.control === "tags" || f.control === "radio") {
    var type = f.control === "radio" ? "radio" : "checkbox";
    html += "<fieldset><legend>" + esc(f.label) + req + "</legend>";
    (f.choices || []).forEach(function (c, i) {
      html += "<label class=\"choice\"><input type=\"" + type + "\" name=\"" + esc(f.target) + "\" value=\"" + esc(c.value) + "\" id=\"" + id + "-" + i + "\"> " + esc(c.label) + "</label>";
    });
    html += "</fieldset>";
  } else if (f.control === "select") {
    html += "<label for=\"" + id + "\">" + esc(f.label) + req + "</label>";
    html += "<select id=\"" + id + "\" name=\"" + esc(f.target) + "\"><option value=\"\">Choose one</option>";
    (f.choices || []).forEach(function (c) { html += "<option value=\"" + esc(c.value) + "\">" + esc(c.label) + "</option>"; });
    if (f.otherOption) html += "<option value=\"" + OTHER + "\">" + esc(f.otherOption.label || "Other") + "</option>";
    html += "</select>";
    if (f.otherOption) html += "<input type=\"text\" data-other=\"" + esc(f.target) + "\" aria-label=\"" + esc(f.label) + ", other\" placeholder=\"Please tell us\" hidden>";
  } else if (f.control === "textarea") {
    html += "<label for=\"" + id + "\">" + esc(f.label) + req + "</label>";
    html += "<textarea id=\"" + id + "\" name=\"" + esc(f.target) + "\" rows=\"4\"></textarea>";
  } else if (f.control === "file" || f.control === "signature") {
    var v = f.validation || {};
    html += "<label for=\"" + id + "\">" + esc(f.label) + req + "</label>";
    html += "<input type=\"file\" id=\"" + id + "\" name=\"" + esc(f.target) + "\"" + (v.accept ? " accept=\"" + esc(v.accept) + "\"" : "") + (v.fileLimit > 1 ? " multiple" : "") + ">";
  } else if (f.control === "checkbox") {
    html += "<label class=\"choice\"><input type=\"checkbox\" id=\"" + id + "\" name=\"" + esc(f.target) + "\"> " + esc(f.label) + req + "</label>";
  } else {
    html += "<label for=\"" + id + "\">" + esc(f.label) + req + "</label>";
    html += "<input type=\"" + inputType(f.control) + "\" id=\"" + id + "\" name=\"" + esc(f.target) + "\"" + (f.control === "phone" ? " autocomplete=\"tel\" inputmode=\"tel\"" : "") + (f.control === "email" ? " autocomplete=\"email\"" : "") + ">";
  }
  if (help) html += "<p class=\"help\">" + esc(help) + "</p>";
  html += "<p class=\"err\" role=\"alert\" hidden></p></div>";
  return html;
}

function prefill(fields) {
  var q = new URLSearchParams(location.search);
  var topic = formEl.getAttribute("data-topic") || "";
  if (topic) fields.forEach(function (f) {
    if (f.control !== "select" || !(f.choices || []).some(function (c) { return c.value === topic; })) return;
    store.setValue(f.target, topic);
    var sel = formEl.querySelector("[name=\"" + f.target + "\"]");
    if (sel) sel.value = topic;
  });
  var hall = (q.get("hall") || "").slice(0, 160);
  var town = (q.get("town") || "").slice(0, 80);
  fields.forEach(function (f) {
    if (f.control !== "text") return;
    var val = /hall|organization/i.test(f.label) ? hall : /town|county/i.test(f.label) ? town : "";
    if (!val) return;
    store.setValue(f.target, val);
    var el = formEl.querySelector("[name=\"" + f.target + "\"]");
    if (el) el.value = val;
  });
}

function build(s) {
  var html = "";
  s.form.fields.forEach(function (f) { byTarget[f.target] = f; html += fieldHtml(f); });
  html += "<p class=\"err\" id=\"form-err\" role=\"alert\" hidden></p>";
  html += "<button class=\"btn\" type=\"submit\">" + esc(s.form.submitText || "Send") + "</button>";
  formEl.innerHTML = html;
  formEl.hidden = false;
  statusEl.hidden = true;
  built = true;
  prefill(s.form.fields);
}

function render(s) {
  if (s.outcome) {
    var msg = plain(s.outcome.message) || "Thank you. We will be in touch.";
    formEl.hidden = true;
    statusEl.hidden = false;
    statusEl.className = "thanks";
    statusEl.innerHTML = msg.split("\n").map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") + "<p><a href=\"https://www.findbingo.org/ohio/\">Back to the bingo finder</a></p>";
    statusEl.focus && statusEl.scrollIntoView({ block: "center" });
    return;
  }
  if (!s.form) {
    statusEl.textContent = s.errors[FORM_ERROR] ? "The form could not load. Please call 614-623-6330 or email travis@vethomeguard.org." : "Loading the form…";
    return;
  }
  if (s.closed) {
    statusEl.textContent = plain(s.form.disabledMessage) || "This form is not taking submissions right now. Please call 614-623-6330.";
    return;
  }
  if (!built) build(s);
  formEl.querySelectorAll(".field").forEach(function (w) {
    var t = w.getAttribute("data-target");
    var err = s.errors[t];
    var p = w.querySelector(".err");
    p.textContent = err || "";
    p.hidden = !err;
    w.querySelectorAll("input, select, textarea").forEach(function (c) {
      if (err) c.setAttribute("aria-invalid", "true"); else c.removeAttribute("aria-invalid");
    });
  });
  var fe = document.getElementById("form-err");
  fe.textContent = s.errors[FORM_ERROR] || "";
  fe.hidden = !s.errors[FORM_ERROR];
  var btn = formEl.querySelector("button[type=submit]");
  btn.disabled = !!s.loading;
  btn.textContent = s.loading ? "Sending…" : (s.form.submitText || "Send");
}

function onChange(e) {
  var el = e.target;
  var other = el.getAttribute("data-other");
  if (other) { store.setValue(other, otherValue(byTarget[other], el.value)); return; }
  var f = byTarget[el.name];
  if (!f) return;
  if (el.type === "file") { store.setValue(f.target, Array.from(el.files || [])); return; }
  if (f.control === "checkboxGroup" || f.control === "tags") {
    var vals = [];
    formEl.querySelectorAll("input[name=\"" + f.target + "\"]:checked").forEach(function (c) { vals.push(c.value); });
    store.setValue(f.target, vals);
    return;
  }
  if (f.control === "checkbox") { store.setValue(f.target, el.checked); return; }
  if (f.control === "select" && f.otherOption) {
    var box = formEl.querySelector("[data-other=\"" + f.target + "\"]");
    if (el.value === OTHER) { box.hidden = false; store.setValue(f.target, otherValue(f, box.value)); box.focus(); return; }
    box.hidden = true;
  }
  if (f.control === "phone") {
    var d = el.value.replace(/[^0-9]/g, "");
    var e164 = el.value.trim().charAt(0) === "+" ? el.value : d.length === 10 ? "+1" + d : d.length === 11 && d.charAt(0) === "1" ? "+" + d : el.value;
    store.setValue(f.target, e164);
    return;
  }
  store.setValue(f.target, el.value);
}

formEl.addEventListener("input", onChange);
formEl.addEventListener("change", onChange);
formEl.addEventListener("focusout", function (e) { if (e.target.name && byTarget[e.target.name]) store.validate(e.target.name); });
formEl.addEventListener("submit", function (e) { store.submit(e); });

store.subscribe(render);
render(store.getState());
store.start();