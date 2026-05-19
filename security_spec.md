# Firebase Security Specification

## Data Invariants
- A user document can only be created if the `uid` matches the authenticated `request.auth.uid`.
- User documents are immutable after creation (except maybe for some profile fields, but here we don't have updates yet).
- Only the owner can read their own user document.

## The "Dirty Dozen" Payloads
1. Create a user document with a different `uid` than the current auth.
2. Create a user document without being signed in.
3. Update another user's email.
4. Delete another user's account document.
5. Create a user document with a 1MB string in the email field.
6. List all user documents as a regular user.
7. Create a user document with a spoofed `createdAt` (client-provided).
8. Create a user document missing required fields.
9. Inject HTML into the `email` field.
10. Update a user document without being the owner.
11. Read a user document without being the owner.
12. Attempt to overwrite a user document's `uid` after creation.
