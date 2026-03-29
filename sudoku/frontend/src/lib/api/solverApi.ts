import type { SolverRequest, SolverResponse } from "../../types/sudoku";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8080";
const SOLVE_ENDPOINT = `${API_BASE_URL}/solve`;

let inFlightController: AbortController | null = null;

export async function checkBackendConnection(timeoutMs = 2500): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(SOLVE_ENDPOINT, {
      method: "OPTIONS",
      signal: controller.signal,
    });

    return response.ok || response.status === 204 || response.status === 405;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export function cancelSolveRequest(): void {
  if (inFlightController) {
    inFlightController.abort();
    inFlightController = null;
  }
}

export async function solvePuzzle(payload: SolverRequest): Promise<SolverResponse> {
  cancelSolveRequest();
  const controller = new AbortController();
  inFlightController = controller;

  let response: Response;

  try {
    response = await fetch(SOLVE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { status: "error", message: "Previous request canceled." };
    }

    return {
      status: "error",
      message: "Network error: unable to reach solver backend.",
    };
  } finally {
    if (inFlightController === controller) {
      inFlightController = null;
    }
  }

  if (!response.ok) {
    let serverMessage = `Server error (${response.status}).`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) {
        serverMessage = body.message;
      }
    } catch {
      // Fallback to generic error text when body is not JSON.
    }

    return { status: "error", message: serverMessage };
  }

  try {
    const data = (await response.json()) as SolverResponse;

    if (data.status === "solved" || data.status === "no_solution") {
      return data;
    }

    return {
      status: "error",
      message: "Backend returned an unexpected response shape.",
    };
  } catch {
    return {
      status: "error",
      message: "Backend returned invalid JSON.",
    };
  }
}

export { API_BASE_URL };
