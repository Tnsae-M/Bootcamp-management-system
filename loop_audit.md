# Backend Loop → Functional-Method Audit

Scanned: all `.js` files under `backend/` (src, scripts, seedAll.js).

---

## Candidates for Replacement

### 1. `validatePassword` — serial if/push accumulator
| | |
|---|---|
| **File** | [`auth.service.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/src/modules/auth/auth.service.js#L40-L83) |
| **Lines** | 40 – 83 |
| **What it does** | Builds an `errors[]` array by testing the password against 6 independent rules, pushing a message for each failure. |
| **Best fit** | **`filter`** (or `flatMap`) — define a rules array of `{ test, message }` objects, then `rules.filter(r => !r.test(password)).map(r => r.message)`. Eliminates the mutable accumulator entirely. |

### 2. `forgotPassword` — notify each admin
| | |
|---|---|
| **File** | [`auth.service.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/src/modules/auth/auth.service.js#L398-L406) |
| **Lines** | 398 – 406 |
| **What it does** | Loops over an `admins` array and `await`s `createNotification()` for each admin sequentially. |
| **Best fit** | **`map` + `Promise.all`** — `await Promise.all(admins.map(admin => createNotification({...})))`. Sends notifications concurrently instead of sequentially, and removes the loop. |

### 3. `createGroup` — validate each member is enrolled
| | |
|---|---|
| **File** | [`group.service.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/src/modules/groups/group.service.js#L17-L26) |
| **Lines** | 17 – 26 |
| **What it does** | Iterates `members`, does an `await Enrollment.findOne()` per member, throws on first failure. |
| **Best fit** | **`map` + `Promise.all`** for the DB lookups, then **`filter`** to find un-enrolled users and throw once. This would batch the queries concurrently. |

### 4. `seedAll` — drop indexes for each model
| | |
|---|---|
| **File** | [`seedAll.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/seedAll.js#L47-L54) |
| **Lines** | 47 – 54 |
| **What it does** | Loops over a `collectionsToClear` array, `await`s `dropIndexes()` on each, swallows errors, and logs. |
| **Best fit** | **`map` + `Promise.allSettled`** — `await Promise.allSettled(collectionsToClear.map(m => m.collection.dropIndexes()))`, then log results. Concurrent + no try/catch needed per item. |

### 5. `listUsers` — forEach to log each user
| | |
|---|---|
| **File** | [`listUsers.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/scripts/listUsers.js#L14-L16) |
| **Lines** | 14 – 16 |
| **What it does** | `users.forEach(u => console.log(...))` — iterates for the side-effect of printing. |
| **Best fit** | **`map`** to build a formatted string array, then `console.log(lines.join('\n'))`. However, `forEach` is the textbook correct choice for pure side-effects. |
| **Verdict** | ⚠️ Borderline — `forEach` is acceptable here. |

---

## Should NOT Change (loop is clearer / can't be replaced)

### 6. `expandRoles` — nested for-of to build a Set
| | |
|---|---|
| **File** | [`role.guard.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/src/middleware/role.guard.js#L10-L18) |
| **Lines** | 10 – 18 |
| **What it does** | Iterates `roles`, then for each role iterates its `ROLE_IMPLIES` array, adding implied roles to a `Set`. |
| **Why keep** | The nested loop mutates a `Set` (not an array), and the logic is a graph traversal / transitive expansion. A `reduce` + `flatMap` version would be **harder to read** with no real benefit. The imperative version is perfectly clear and idiomatic. |
| **Verdict** | ✅ **Keep as-is.** |

### 7. `fixRoles` — for-of with conditional DB update + counter
| | |
|---|---|
| **File** | [`fixRoles.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/scripts/fixRoles.js#L15-L39) |
| **Lines** | 15 – 39 |
| **What it does** | Iterates all users, inspects/parses `role`, conditionally fixes it via `findByIdAndUpdate`, increments a `fixed` counter. |
| **Why keep** | Complex branching (Array check, JSON parse with try/catch, conditional update, counter). A `reduce` or `filter`+`map` version would split the logic across multiple passes and obscure the intent. The `for` loop keeps the **inspect → decide → fix → count** pipeline in one readable block. |
| **Verdict** | ✅ **Keep as-is.** |

### 8. `addMember` — single `.push()` on a Mongoose doc array
| | |
|---|---|
| **File** | [`group.service.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/src/modules/groups/group.service.js#L61) |
| **Line** | 61 |
| **What it does** | `group.members.push(userId)` — appends one element to a Mongoose array. |
| **Why keep** | This is not a loop pattern at all; it's a single Mongoose document mutation. Nothing to replace. |
| **Verdict** | ✅ **Keep as-is** (not a loop). |

### 9. `validatePassword` `errors.push()` calls — independent if/push (detail)
| | |
|---|---|
| **File** | [`auth.service.js`](file:///c:/_web_dev_files/CSEC-DEV/csec-astu-bms-project/backend/src/modules/auth/auth.service.js#L40-L83) |
| **Note** | Already listed as **Candidate #1** above. Mentioning here because someone might argue the sequential `if/push` reads fine as-is. It does, but the duplication is real — six near-identical blocks differ only in the regex and the message string. A data-driven `filter` version is both shorter and easier to extend with new rules. |

---

## Summary Table

| # | File | Lines | Pattern | Recommended Method | Change? |
|---|------|-------|---------|--------------------|---------|
| 1 | `auth.service.js` | 40–83 | if/push accumulator ×6 | `filter` + `map` (rules array) | ✅ Yes |
| 2 | `auth.service.js` | 398–406 | `for..of` + sequential `await` | `map` + `Promise.all` | ✅ Yes |
| 3 | `group.service.js` | 17–26 | `for..of` + sequential `await` | `map` + `Promise.all` + `filter` | ✅ Yes |
| 4 | `seedAll.js` | 47–54 | `for..of` + `await` + try/catch | `map` + `Promise.allSettled` | ✅ Yes |
| 5 | `listUsers.js` | 14–16 | `forEach` + `console.log` | `forEach` is fine (pure side-effect) | ⚠️ Optional |
| 6 | `role.guard.js` | 10–18 | nested `for..of` → `Set.add` | — | ❌ Keep |
| 7 | `fixRoles.js` | 15–39 | `for..of` + branching + counter | — | ❌ Keep |
| 8 | `group.service.js` | 61 | single `.push()` (not a loop) | — | ❌ N/A |
