"use client";

import { deleteCategory } from "../actions";

export function DeleteTopic({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteCategory.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete the topic "${title}"? Its videos stay in your video library.`)) e.preventDefault();
      }}
    >
      <button className="btn btn-outline btn-small" type="submit">Delete topic</button>
    </form>
  );
}
