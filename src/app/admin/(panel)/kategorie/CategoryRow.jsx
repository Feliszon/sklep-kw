"use client";

import { useActionState, useEffect, useState } from "react";
import { renameCategoryAction, deleteCategoryAction } from "./actions";

export default function CategoryRow({ name, count }) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameFormAction, renamePending] = useActionState(
    renameCategoryAction.bind(null, name),
    null
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteCategoryAction.bind(null, name),
    null
  );

  useEffect(() => {
    if (renameState?.done) setEditing(false);
  }, [renameState]);

  return (
    <tr className="transition hover:bg-neutral-50">
      <td className="px-4 py-3">
        {editing ? (
          <form action={renameFormAction} className="flex items-center gap-2">
            <input
              name="name"
              defaultValue={name}
              autoFocus
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
            />
            <button
              type="submit"
              disabled={renamePending}
              className="text-xs font-semibold uppercase tracking-wide text-black hover:underline"
            >
              Zapisz
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:text-black"
            >
              Anuluj
            </button>
          </form>
        ) : (
          <span className="font-medium text-black">{name}</span>
        )}
        {renameState?.error && (
          <p className="mt-1 text-xs text-red-600">{renameState.error}</p>
        )}
      </td>
      <td className="px-4 py-3 text-neutral-600">{count}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-semibold uppercase tracking-wide text-neutral-600 hover:text-black hover:underline"
            >
              Zmień nazwę
            </button>
          )}
          <form
            action={deleteFormAction}
            onSubmit={(e) => {
              if (!confirm(`Usunąć kategorię „${name}”?`)) e.preventDefault();
            }}
          >
            <button
              type="submit"
              disabled={deletePending}
              className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:underline"
            >
              Usuń
            </button>
          </form>
        </div>
        {deleteState?.error && (
          <p className="mt-1 text-right text-xs text-red-600">{deleteState.error}</p>
        )}
      </td>
    </tr>
  );
}
