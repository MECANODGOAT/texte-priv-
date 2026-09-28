"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  return (
    <form action={action} className="panel stack">
      {state.error && <p className="alert" role="alert">{state.error}</p>}
      <label className="field" htmlFor="email">
        E-mail
        <input id="email" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="field" htmlFor="password">
        Mot de passe
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
