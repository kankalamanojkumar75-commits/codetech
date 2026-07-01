/**
 * Auth module — handles all Supabase authentication logic and modal UI.
 *
 * Exports:
 *  - initAuth()   wire up the modal and session listener
 *  - openAuth(tab?) open the modal programmatically ('login' | 'signup')
 */

import { supabase } from './supabase.js';

/* ---- Helpers ---- */
function $(id) { return document.getElementById(id); }

function initials(email) {
  return email ? email.slice(0, 2).toUpperCase() : 'U';
}

function displayName(user) {
  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
}

/* ---- Show / hide auth message ---- */
function setMessage(text, type = 'error') {
  const el = $('authMessage');
  if (!el) return;
  el.textContent = text;
  el.className = `auth-message ${type}`;
  el.style.display = text ? 'flex' : 'none';
}

/* ---- Loading state on submit buttons ---- */
function setLoading(btnId, loading, originalHTML) {
  const btn = $(btnId);
  if (!btn) return;
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
    btn.classList.add('loading');
  } else {
    btn.innerHTML = btn.dataset.orig || originalHTML;
    btn.classList.remove('loading');
  }
}

/* ---- Tab switching ---- */
function showTab(tab) {
  const loginForm = $('loginForm');
  const signupForm = $('signupForm');
  const resetForm = $('resetForm');
  const loginTabBtn = $('loginTabBtn');
  const signupTabBtn = $('signupTabBtn');
  const tabBar = document.querySelector('.auth-tabs');

  setMessage('');

  [loginForm, signupForm, resetForm].forEach(f => f && (f.style.display = 'none'));

  if (tab === 'signup') {
    signupForm && (signupForm.style.display = 'block');
    loginTabBtn?.classList.remove('active');
    signupTabBtn?.classList.add('active');
    signupTabBtn?.setAttribute('aria-selected', 'true');
    loginTabBtn?.setAttribute('aria-selected', 'false');
    tabBar && (tabBar.style.display = '');
  } else if (tab === 'reset') {
    resetForm && (resetForm.style.display = 'block');
    tabBar && (tabBar.style.display = 'none');
  } else {
    loginForm && (loginForm.style.display = 'block');
    loginTabBtn?.classList.add('active');
    signupTabBtn?.classList.remove('active');
    loginTabBtn?.setAttribute('aria-selected', 'true');
    signupTabBtn?.setAttribute('aria-selected', 'false');
    tabBar && (tabBar.style.display = '');
  }
}

/* ---- Open / close modal ---- */
export function openAuth(tab = 'login') {
  const overlay = $('authOverlay');
  if (!overlay) return;
  showTab(tab);
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  const firstInput = overlay.querySelector('input');
  setTimeout(() => firstInput?.focus(), 120);
}

function closeAuth() {
  const overlay = $('authOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  setMessage('');
}

/* ---- Update navbar after auth state change ---- */
function applySession(user) {
  const loginBtn = $('loginBtn');
  const getStartedBtn = $('getStartedBtn');
  const userMenu = $('userMenu');
  const userAvatar = $('userAvatar');
  const userName = $('userName');
  const dropdownEmail = $('dropdownEmail');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (getStartedBtn) getStartedBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = '';
    if (userAvatar) userAvatar.textContent = initials(user.email);
    if (userName) userName.textContent = displayName(user);
    if (dropdownEmail) dropdownEmail.textContent = user.email;
  } else {
    if (loginBtn) loginBtn.style.display = '';
    if (getStartedBtn) getStartedBtn.style.display = '';
    if (userMenu) userMenu.style.display = 'none';
  }
}

/* ---- Password toggle ---- */
function wirePasswordToggles() {
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      const icon = btn.querySelector('i');
      if (icon) icon.className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  });
}

/* ---- LOGIN ---- */
async function handleLogin(e) {
  e.preventDefault();
  const email = $('loginEmail')?.value.trim();
  const password = $('loginPassword')?.value;
  if (!email || !password) { setMessage('Please fill in all fields.'); return; }
  setLoading('loginSubmit', true);
  setMessage('');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  setLoading('loginSubmit', false);
  if (error) {
    const msg = error.message.includes('Invalid login')
      ? 'Invalid email or password. Please try again.'
      : error.message;
    setMessage(msg, 'error');
    return;
  }
  closeAuth();
  showGlobalToast(`Welcome back, ${displayName(data.user)}!`, 'success');
}

/* ---- SIGN UP ---- */
async function handleSignup(e) {
  e.preventDefault();
  const name = $('signupName')?.value.trim();
  const email = $('signupEmail')?.value.trim();
  const password = $('signupPassword')?.value;
  const confirm = $('signupConfirm')?.value;

  if (!name || !email || !password || !confirm) { setMessage('Please fill in all fields.'); return; }
  if (password.length < 8) { setMessage('Password must be at least 8 characters.'); return; }
  if (password !== confirm) {
    setMessage('Passwords do not match.');
    $('signupConfirm')?.classList.add('invalid');
    return;
  }
  $('signupConfirm')?.classList.remove('invalid');
  setLoading('signupSubmit', true);
  setMessage('');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  setLoading('signupSubmit', false);
  if (error) {
    const msg = error.message.includes('already registered')
      ? 'An account with this email already exists. Please sign in.'
      : error.message;
    setMessage(msg, 'error');
    return;
  }

  if (data.session) {
    closeAuth();
    showGlobalToast(`Account created! Welcome, ${name}!`, 'success');
  } else {
    setMessage('Account created! Please check your email to confirm your address.', 'success');
  }
}

/* ---- PASSWORD RESET ---- */
async function handleReset(e) {
  e.preventDefault();
  const email = $('resetEmail')?.value.trim();
  if (!email) { setMessage('Please enter your email address.'); return; }
  setLoading('resetSubmit', true);
  setMessage('');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });

  setLoading('resetSubmit', false);
  if (error) { setMessage(error.message, 'error'); return; }
  setMessage('Password reset email sent! Check your inbox.', 'success');
}

/* ---- SIGN OUT ---- */
async function handleLogout() {
  await supabase.auth.signOut();
  showGlobalToast('Signed out successfully.', 'success');
}

/* ---- Toast helper (delegates to global showToast in script.js) ---- */
function showGlobalToast(msg, type) {
  window.dispatchEvent(new CustomEvent('ct:toast', { detail: { msg, type } }));
}

/* ---- User dropdown toggle ---- */
function initUserDropdown() {
  const trigger = $('userMenuTrigger');
  const dropdown = $('userDropdown');
  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', () => {
    const open = dropdown.classList.toggle('open');
    trigger.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', e => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      trigger.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---- Main init ---- */
export function initAuth() {
  // Restore existing session
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    applySession(session?.user ?? null);
  })();

  // Listen for session changes
  supabase.auth.onAuthStateChange((event, session) => {
    (async () => {
      applySession(session?.user ?? null);
      if (event === 'SIGNED_OUT') applySession(null);
    })();
  });

  // Close overlay
  $('authClose')?.addEventListener('click', closeAuth);
  $('authOverlay')?.addEventListener('click', e => {
    if (e.target.id === 'authOverlay') closeAuth();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });

  // Tab buttons
  document.querySelectorAll('.auth-tab').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  // Switch links (inside forms)
  document.querySelectorAll('.auth-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.switch));
  });

  // Forgot password
  $('forgotPwBtn')?.addEventListener('click', () => showTab('reset'));

  // Forms
  $('loginForm')?.addEventListener('submit', handleLogin);
  $('signupForm')?.addEventListener('submit', handleSignup);
  $('resetForm')?.addEventListener('submit', handleReset);

  // Logout
  $('logoutBtn')?.addEventListener('click', handleLogout);

  // Open buttons
  $('loginBtn')?.addEventListener('click', () => openAuth('login'));
  $('getStartedBtn')?.addEventListener('click', () => openAuth('signup'));

  wirePasswordToggles();
  initUserDropdown();
}
