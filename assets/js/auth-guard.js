// SCHITAB — Admin auth guard
// Include this on every admin page BEFORE any page-specific script runs.
// Redirects to login if not signed in, or if signed in but not an admin.

async function requireAdmin() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = '/index.html';
    return null;
  }

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, is_admin')
    .eq('id', session.user.id)
    .single();

  if (error || !profile || !profile.is_admin) {
    await supabaseClient.auth.signOut();
    window.location.href = '/index.html?denied=1';
    return null;
  }

  return { session, profile };
}

async function logoutAdmin() {
  await supabaseClient.auth.signOut();
  window.location.href = '/index.html';
}
