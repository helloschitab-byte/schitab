# Schitab Admin Panel — Setup & Deploy

## 1. One-time Supabase SQL (storage upload permission)

Run this once in Supabase SQL Editor (Database mode) so admin cover uploads work:

```sql
create policy "admin_upload_covers"
on storage.objects for insert
with check (bucket_id = 'book-covers' and is_admin());

create policy "admin_manage_covers"
on storage.objects for all
using (bucket_id = 'book-covers' and is_admin());
```

## 2. Deploy

1. Push this whole folder to your GitHub repo (root level — index.html should be at repo root, not inside a subfolder).
2. In Netlify: connect the repo, no build command needed (this is plain HTML/CSS/JS), publish directory = `/` (root).
3. Deploy. Netlify gives you a live `.netlify.app` URL.

## 3. Log in

Go to `https://your-site.netlify.app/index.html` and log in with your admin email
(hello.schitab@gmail.com) and the password you set when creating that Supabase auth user.

## 4. Using the admin panel

- **Categories tab** — add top-level categories first (School, Competitive Exams, etc.),
  then add sub-categories choosing a parent.
- **Books tab** — add a book: pick category, enter MRP + selling price, optionally upload
  a cover photo (or paste an image URL instead).
- **Used Books tab** — will show submissions once the future public "Sell Your Books" form
  is built and connected to the same `used_books` table. Empty for now — that's expected.

## File structure

```
/index.html                 — login page
/admin/dashboard.html       — main admin panel (books, categories, used books)
/assets/css/style.css       — design system (locked colors/fonts)
/assets/js/supabase-client.js
/assets/js/auth-guard.js
/assets/js/ui.js
/assets/js/categories.js
/assets/js/books.js
/assets/js/used-books.js
```
