import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React rendering error in ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem("codemaster_progress");
      sessionStorage.clear();
    } catch (e) {
      console.warn("Failed to clear storage:", e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] flex items-center justify-center p-6 font-['Geist',sans-serif]">
          <div className="max-w-lg w-full rounded-2xl border border-[rgba(26,26,26,0.12)] bg-white p-6 sm:p-8 shadow-sm space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-[#1a1a1a] tracking-tight font-['Cormorant_Garamond',serif]">
                页面渲染遇到意外错误
              </h1>
              <p className="text-sm text-[rgba(26,26,26,0.65)] leading-relaxed">
                应用遇到未预期的运行时异常（可能是由于旧版学习记录缓存不兼容导致）。您可以尝试刷新或一键修复本地进度缓存。
              </p>
            </div>

            {this.state.error && (
              <div className="text-left rounded-xl bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] p-3.5 text-xs font-mono text-rose-800 overflow-x-auto max-h-36">
                <div className="font-bold text-[rgba(26,26,26,0.6)] mb-1">错误诊断信息:</div>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="btn btn-run flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                <span>刷新并重试</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="btn flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-neutral-50 border border-[rgba(26,26,26,0.15)] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-all active:scale-95"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
                <span>修复并重置学习缓存</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
