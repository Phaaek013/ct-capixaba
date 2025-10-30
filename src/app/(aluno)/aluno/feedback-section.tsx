"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";

import type { FeedbackActionState } from "./actions";

type Feedback = {
  id: number;
  nota: number;
  rpe: string | null;
  observacoes: string | null;
} | null;

type Props = {
  treinoId: number;
  feedback: Feedback;
  createAction: (state: FeedbackActionState, formData: FormData) => Promise<FeedbackActionState>;
  updateAction: (state: FeedbackActionState, formData: FormData) => Promise<FeedbackActionState>;
};

const INITIAL_STATE: FeedbackActionState = {
  status: "idle",
  message: null
};

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Enviando..." : children}
    </button>
  );
}

export default function FeedbackSection({
  treinoId,
  feedback,
  createAction,
  updateAction
}: Props) {
  const [editing, setEditing] = useState(!feedback);
  const [createState, createDispatch] = useFormState(createAction, INITIAL_STATE);
  const [updateState, updateDispatch] = useFormState(updateAction, INITIAL_STATE);

  useEffect(() => {
    setEditing(!feedback);
  }, [feedback?.id]);

  const formState = feedback && editing ? updateState : createState;

  if (!feedback || editing) {
    const action = feedback ? updateDispatch : createDispatch;

    return (
      <form action={action} className="mt-3 space-y-3">
        <input type="hidden" name="treinoId" value={treinoId} />
        {feedback ? <input type="hidden" name="feedbackId" value={feedback.id} /> : null}
        <div className="space-y-1">
          <label htmlFor="nota" className="text-sm font-medium">
            Nota (1 a 10)
          </label>
          <select
            id="nota"
            name="nota"
            defaultValue={feedback ? String(feedback.nota) : ""}
            required
            className="w-full rounded border border-slate-300 p-2 text-sm"
          >
            <option value="" disabled>
              Selecione
            </option>
            {Array.from({ length: 10 }).map((_, index) => {
              const value = String(index + 1);
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="rpe" className="text-sm font-medium">
            RPE (opcional)
          </label>
          <input
            id="rpe"
            name="rpe"
            defaultValue={feedback?.rpe ?? ""}
            className="w-full rounded border border-slate-300 p-2 text-sm"
            placeholder="Percepção de esforço"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="treinoRealizado" value="1" className="h-4 w-4" />
            <span>Marcar treino como realizado</span>
          </label>
          <label className="text-sm flex items-center gap-2">
            <span className="text-xs text-slate-600">Tempo (min)</span>
            <input
              type="text"
              name="tempoTreino"
              defaultValue={""}
              placeholder="ex: 45"
              className="w-20 rounded border border-slate-300 p-1 text-sm"
            />
          </label>
        </div>
        <div className="space-y-1">
          <label htmlFor="observacoes" className="text-sm font-medium">
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={4}
            defaultValue={feedback?.observacoes ?? ""}
            className="w-full rounded border border-slate-300 p-2 text-sm"
            placeholder="Compartilhe como se sentiu no treino"
          />
        </div>
        {formState.message ? (
          <p
            className={`text-sm ${
              formState.status === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {formState.message}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <SubmitButton>{feedback ? "Atualizar feedback" : "Enviar feedback"}</SubmitButton>
          {feedback ? (
            <button
              type="button"
              className="text-sm text-slate-600 underline"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3 space-y-2 text-sm">
      <p>
        <span className="font-medium">Nota:</span> {feedback.nota}
      </p>
      {feedback.rpe ? (
        <p>
          <span className="font-medium">RPE:</span> {feedback.rpe}
        </p>
      ) : null}
      {feedback.observacoes ? (
        <p className="whitespace-pre-wrap">
          <span className="font-medium">Observações:</span> {feedback.observacoes}
        </p>
      ) : null}
      <button
        type="button"
        className="text-sm text-blue-600 underline"
        onClick={() => setEditing(true)}
      >
        Editar feedback
      </button>
    </div>
  );
}
