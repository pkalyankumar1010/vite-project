declare global {
  interface Window {
    vscode?: {
      postMessage(message: unknown): void;
    };
  }
}

export {}; 