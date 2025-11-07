/**
 * api.js — mock now, real later
 * Works with your current application.html fields (including file names).
 * Flip API_MODE to 'real' when you have a backend.
 */

/* ===== CONFIG ===== */
const API_MODE = 'mock';              // 'mock' (today) | 'real' (later)
const REAL_BASE_URL = 'http://localhost:3000'; // change when backend exists

/* ===== Data contract (keep stable) ===== */
function buildApplicationPayload(formData) {
  return {
    firstName: formData.firstName || '',
    lastName:  formData.lastName  || '',
    email:     formData.email     || '',
    phone:     formData.phone     || '',
    school:    formData.school    || '',
    district:  formData.district  || '',
    city:      formData.city      || '',
    state:     formData.state     || '',
    zip:       formData.zip       || '',
    department: formData.department || '',
    eligibility: formData.eligibility || '',
    degree: formData.degree || '',
    experience: formData.experience || '',
    transcriptName: formData.transcriptName || '',
    coverLetterName: formData.coverLetterName || '',
    resumeName: formData.resumeName || '',
    agreePolicy: !!formData.agreePolicy,
    signature: formData.signature || '',
    sigDate:   formData.sigDate   || '',
    status: 'Submitted'
  };
}

/* ===== MOCK IMPLEMENTATION (today) ===== */
const LS_APPS_KEY = 'acp_apps';
const newId = () => 'app_' + Math.random().toString(36).slice(2);

async function createApplication_mock(payload) {
  const list = JSON.parse(localStorage.getItem(LS_APPS_KEY) || '[]');
  const id = newId();
  const now = new Date().toISOString();
  list.push({ id, createdAt: now, updatedAt: now, ...payload });
  localStorage.setItem(LS_APPS_KEY, JSON.stringify(list));
  await new Promise(r => setTimeout(r, 300)); // tiny delay for realism
  return { ok: true, id };
}

/* ===== REAL IMPLEMENTATION (later) ===== */
async function createApplication_real(payload) {
  const res = await fetch(`${REAL_BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json(); // expect { ok:true, id }
}

/* ===== Public function your page calls ===== */
async function submitTeacherApplication(formData) {
  const payload = buildApplicationPayload(formData);
  if (API_MODE === 'mock') {
    return createApplication_mock(payload);
  } else {
    return createApplication_real(payload);
  }
}
