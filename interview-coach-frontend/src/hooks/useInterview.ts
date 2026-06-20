import { useState, useCallback, useRef, useEffect } from "react";
import {
  startInterview,
  submitInterviewAnswer,
  endInterview,
} from "../services/api";
import type {
  Difficulty,
  QuestionOut,
  AnswerEvaluation,
  EndInterviewResponse,
} from "../types/interview";

type Phase = "idle" | "active" | "evaluating" | "complete";

interface UseInterviewResult {
  phase: Phase;
  sessionId: string | null;
  currentQuestion: QuestionOut | null;
  questionsAsked: number;
  maxQuestions: number;
  lastEvaluation: AnswerEvaluation | null;
  finalResult: EndInterviewResponse | null;
  elapsedSeconds: number;
  loading: boolean;
  error: string | null;
  start: (role: string, difficulty: Difficulty) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  finish: () => Promise<void>;
  reset: () => void;
}

export function useInterview(): UseInterviewResult {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionOut | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [finalResult, setFinalResult] = useState<EndInterviewResponse | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "active" || phase === "evaluating") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const start = useCallback(async (role: string, difficulty: Difficulty) => {
    setLoading(true);
    setError(null);
    try {
      const data = await startInterview({ role, difficulty });
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setQuestionsAsked(0);
      setElapsedSeconds(0);
      setLastEvaluation(null);
      setFinalResult(null);
      setPhase("active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!sessionId || !currentQuestion) return;
      setLoading(true);
      setError(null);
      setPhase("evaluating");
      try {
        const data = await submitInterviewAnswer({
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer,
        });
        setLastEvaluation(data.evaluation);
        setQuestionsAsked(data.questions_asked);
        setMaxQuestions(data.max_questions);

        if (data.is_complete || !data.next_question) {
          // auto-finish once the last question is evaluated
          const result = await endInterview(sessionId);
          setFinalResult(result);
          setPhase("complete");
        } else {
          setCurrentQuestion(data.next_question);
          setPhase("active");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit answer.");
        setPhase("active");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, currentQuestion]
  );

  const finish = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await endInterview(sessionId);
      setFinalResult(result);
      setPhase("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end interview.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const reset = useCallback(() => {
    setPhase("idle");
    setSessionId(null);
    setCurrentQuestion(null);
    setQuestionsAsked(0);
    setLastEvaluation(null);
    setFinalResult(null);
    setElapsedSeconds(0);
    setError(null);
  }, []);

  return {
    phase,
    sessionId,
    currentQuestion,
    questionsAsked,
    maxQuestions,
    lastEvaluation,
    finalResult,
    elapsedSeconds,
    loading,
    error,
    start,
    submitAnswer,
    finish,
    reset,
  };
}