import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../AppStore";
import { effectiveConfig, type Profile } from "../core/data";
import { generateRound } from "../core/generate";
import { randomSeed } from "../core/rng";
import {
  currentItem,
  nextTask,
  startRound,
  submitAnswer,
  type RoundPhase,
  type RoundState,
  type TaskOutcome,
} from "../core/session";
import type { Answer, AnyTaskType, CheckResult } from "../core/types";
import { findTaskType } from "../tasks/registry";
import { Button, Screen } from "../ui/Layout";
import { playCorrect } from "../ui/sound";

const LOB = ["Super!", "Richtig!", "Toll gemacht!", "Prima!", "Genau!"];
/** So lange bleibt „Richtig“ stehen, bevor es automatisch weitergeht. */
const AUTO_WEITER_MS = 1300;

export function Uebung({
  typeId,
  onFinish,
  onCancel,
}: {
  typeId: string;
  onFinish: (outcomes: TaskOutcome[]) => void;
  onCancel: () => void;
}) {
  const { profile } = useStore();
  const type = findTaskType(typeId);
  const [round, setRound] = useState<RoundState | null>(() =>
    profile && type
      ? startRound(
          generateRound(
            type,
            effectiveConfig(profile, type),
            randomSeed(),
            profile.general.aufgabenProRunde,
          ),
        )
      : null,
  );

  const toene = profile?.general.toene ?? false;
  const handleSubmit = useCallback(
    (result: CheckResult) => {
      if (result.status === "richtig" && toene) playCorrect();
      setRound((r) => (r ? submitAnswer(r, result) : r));
    },
    [toene],
  );
  const handleNext = useCallback(() => setRound((r) => (r ? nextTask(r) : r)), []);

  const empty = round !== null && round.items.length === 0;
  // Rundenende genau einmal melden (auch wenn Effekte doppelt laufen).
  const reported = useRef(false);
  useEffect(() => {
    if (round?.phase === "fertig" && !empty && !reported.current) {
      reported.current = true;
      onFinish(round.outcomes);
    }
  }, [round, empty, onFinish]);

  if (!profile || !type || !round) return null;

  if (empty) {
    return (
      <Screen className="items-center justify-center gap-6 text-center">
        <p className="text-2xl">Mit diesen Einstellungen gibt es leider keine Aufgaben.</p>
        <p className="text-lg text-slate-600">
          Bitte im Eltern-Bereich die Einstellungen anpassen.
        </p>
        <Button onClick={onCancel}>Zurück</Button>
      </Screen>
    );
  }

  const item = currentItem(round);
  const answered = round.phase === "richtig" || round.phase === "loesung";
  const progress = (round.index + (answered ? 1 : 0)) / round.items.length;

  return (
    <Screen className="gap-4">
      <header className="flex items-center gap-4">
        <AbbrechenButton onCancel={onCancel} />
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={round.items.length}
          aria-valuenow={round.index}
        >
          <div
            className="h-full rounded-full bg-haupt transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="zahl text-lg text-slate-500">
          {Math.min(round.index + 1, round.items.length)}/{round.items.length}
        </span>
      </header>

      {item && (
        <AufgabeRunner
          key={round.index}
          type={type}
          task={item.task}
          isRepeat={item.repeat}
          phase={round.phase}
          requeued={round.requeued}
          lastCheck={round.lastCheck}
          praise={LOB[round.index % LOB.length]!}
          general={profile.general}
          onSubmit={handleSubmit}
          onNext={handleNext}
        />
      )}
    </Screen>
  );
}

function AbbrechenButton({ onCancel }: { onCancel: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">Aufhören?</span>
        <button
          type="button"
          className="min-h-[48px] rounded-xl bg-white px-4 text-lg"
          onClick={onCancel}
        >
          Ja
        </button>
        <button
          type="button"
          className="min-h-[48px] rounded-xl bg-haupt px-4 text-lg text-white"
          onClick={() => setConfirm(false)}
        >
          Weiter üben
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-label="Runde beenden"
      className="h-12 w-12 rounded-xl bg-white text-2xl text-slate-500"
      onClick={() => setConfirm(true)}
    >
      ✕
    </button>
  );
}

function AufgabeRunner({
  type,
  task,
  isRepeat,
  phase,
  requeued,
  lastCheck,
  praise,
  general,
  onSubmit,
  onNext,
}: {
  type: AnyTaskType;
  task: unknown;
  isRepeat: boolean;
  phase: RoundPhase;
  requeued: boolean;
  lastCheck: CheckResult | null;
  praise: string;
  general: Profile["general"];
  onSubmit: (result: CheckResult) => void;
  onNext: () => void;
}) {
  const [answer, setAnswerState] = useState<Answer>(() => type.emptyAnswer(task));
  const [wrongFields, setWrongFields] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  // „Richtig“ geht nach kurzer Zeit von selbst weiter.
  useEffect(() => {
    if (phase !== "richtig") return;
    const t = setTimeout(onNext, AUTO_WEITER_MS);
    return () => clearTimeout(t);
  }, [phase, onNext]);

  const setAnswer = (next: Answer) => {
    // Markierung verschwindet, sobald das Feld geändert wird.
    setWrongFields((wf) => wf.filter((f) => next[f] === answer[f]));
    setAnswerState(next);
  };

  const submit = () => {
    const result = type.check(task, answer);
    setWrongFields(result.wrongFields);
    onSubmit(result);
  };

  const revealed = phase === "loesung";
  const locked = phase === "richtig" || phase === "loesung";
  const hint = general.tipps && type.hint ? type.hint(task) : null;

  let panel = null;
  if (phase === "eingabe" && isRepeat) {
    panel = (
      <p className="text-lg text-slate-500">Diese Aufgabe kennst du schon – probier es nochmal!</p>
    );
  } else if (phase === "falsch") {
    panel = (
      <div className="einblenden flex w-full flex-col items-center gap-3 rounded-2xl bg-fast-hell p-4 text-center">
        <p className="text-2xl font-semibold text-fast">
          {lastCheck?.status === "teilweise"
            ? "Fast! Ein Teil stimmt schon."
            : "Fast! Versuch es nochmal."}
        </p>
        {hint &&
          (showHint ? (
            <p className="text-2xl">💡 {hint}</p>
          ) : (
            <button
              type="button"
              className="min-h-[48px] rounded-xl bg-white px-5 text-lg"
              onClick={() => setShowHint(true)}
            >
              💡 Tipp anzeigen
            </button>
          ))}
      </div>
    );
  } else if (phase === "richtig") {
    panel = (
      <button
        type="button"
        onClick={onNext}
        className="einblenden w-full rounded-2xl bg-gut-hell p-6 text-center text-3xl font-bold text-gut"
      >
        ✓ {praise}
      </button>
    );
  } else if (phase === "loesung") {
    panel = (
      <div className="einblenden flex w-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xl font-semibold">So geht es:</p>
        {general.loesungsweg ? (
          <ol className="zahl flex flex-col gap-1 text-2xl">
            {type.solution(task).map((s, i) => (
              <li key={i}>{s.text}</li>
            ))}
          </ol>
        ) : (
          <p className="text-xl">Die richtige Lösung steht jetzt in der Aufgabe.</p>
        )}
        {requeued && (
          <p className="text-lg text-slate-500">Diese Aufgabe kommt am Ende noch einmal.</p>
        )}
        <Button onClick={onNext}>Weiter</Button>
      </div>
    );
  }

  const View = type.Component;
  return (
    <View
      task={task}
      answer={revealed ? type.correctAnswer(task) : answer}
      setAnswer={setAnswer}
      submit={submit}
      wrongFields={revealed ? [] : wrongFields}
      locked={locked}
      revealed={revealed}
      panel={panel}
    />
  );
}
