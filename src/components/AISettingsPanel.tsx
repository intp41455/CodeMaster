/**
 * AI 连接设置面板 —— BYOK（用户自带 Key）
 *
 * 用户在此选择模型厂商、填写自己的 API Key（仅保存在浏览器本地）、
 * 选择模型并可一键测试连接。未配置的用户自动使用内置本地引擎。
 */

import React, { useEffect, useState } from "react";
import { X, KeyRound, PlugZap, CheckCircle2, XCircle, Trash2, ExternalLink } from "lucide-react";
import { LLM_PROVIDERS, getLLMConfig, saveLLMConfig, clearLLMConfig, testConnection } from "../utils/llmClient";
import type { LLMConfig } from "../utils/llmClient";

interface AISettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ open, onClose }) => {
  const [providerId, setProviderId] = useState<string>("gemini");
  const [baseURL, setBaseURL] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    const cfg = getLLMConfig();
    if (cfg) {
      setProviderId(cfg.providerId);
      setBaseURL(cfg.baseURL);
      setApiKey(cfg.apiKey);
      setModel(cfg.model);
      setTemperature(cfg.temperature ?? 0.7);
    } else {
      const preset = LLM_PROVIDERS[1]; // Gemini 默认
      setProviderId(preset.id);
      setBaseURL(preset.baseURL);
      setModel(preset.defaultModel);
      setApiKey("");
      setTemperature(0.7);
    }
    setTestResult(null);
    setSaved(false);
  }, [open]);

  if (!open) return null;

  const activePreset = LLM_PROVIDERS.find((p) => p.id === providerId);

  const handleProviderChange = (id: string) => {
    setProviderId(id);
    const preset = LLM_PROVIDERS.find((p) => p.id === id);
    if (preset) {
      setBaseURL(preset.baseURL);
      setModel(preset.defaultModel);
      setTestResult(null);
    }
  };

  const handleSave = () => {
    const cfg: LLMConfig = { providerId, baseURL, apiKey, model, temperature };
    saveLLMConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearLLMConfig();
    setApiKey("");
    const preset = LLM_PROVIDERS[1];
    setProviderId(preset.id);
    setBaseURL(preset.baseURL);
    setModel(preset.defaultModel);
    setTestResult({ ok: true, message: "已清除配置，AI 功能将使用内置本地引擎。" });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection({ providerId, baseURL, apiKey, model, temperature });
    setTestResult(result);
    setTesting(false);
  };

  const canTest = baseURL.trim().length > 0 && model.trim().length > 0 && (apiKey.trim().length > 0 || providerId === "ollama");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 font-['Geist',sans-serif]" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white shadow-2xl text-[#1a1a1a]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">AI 连接设置</div>
              <div className="text-[11px] text-[rgba(26,26,26,0.5)]">自带 API Key，选择你喜欢的模型</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-[#1a1a1a] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs leading-relaxed text-amber-900">
            你的 Key 仅保存在<b>你自己的浏览器</b>中，直接发送给所选模型厂商，不经过本站服务器。
            未配置时，站点自动使用内置本地引擎（不需任何 Key）。
          </p>

          <label className="block">
            <span className="text-xs font-semibold text-[rgba(26,26,26,0.7)]">模型厂商</span>
            <select
              value={providerId}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[rgba(26,26,26,0.15)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {LLM_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[rgba(26,26,26,0.7)]">接口地址 Base URL</span>
            <input
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder={activePreset?.placeholder || "https://api.example.com/v1"}
              className="mt-1 w-full rounded-lg border border-[rgba(26,26,26,0.15)] bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <span className="mt-1 block text-[11px] text-[rgba(26,26,26,0.45)]">OpenAI 兼容格式，尾部无需加 /chat/completions</span>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[rgba(26,26,26,0.7)]">API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={activePreset?.id === "ollama" ? "本地模型可留空" : "sk-..."}
              className="mt-1 w-full rounded-lg border border-[rgba(26,26,26,0.15)] bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {activePreset?.docs && (
              <a href={activePreset.docs} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
                去该厂商申请 Key <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-[rgba(26,26,26,0.7)]">模型名</span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="model-name"
                className="mt-1 w-full rounded-lg border border-[rgba(26,26,26,0.15)] bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[rgba(26,26,26,0.7)]">温度 temperature</span>
              <input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[rgba(26,26,26,0.15)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </label>
          </div>

          {testResult && (
            <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
              testResult.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {testResult.ok ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span className="break-all">{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> 清除配置
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTest}
                disabled={!canTest || testing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(26,26,26,0.15)] bg-white px-4 py-2 text-xs font-semibold text-[#1a1a1a] hover:bg-neutral-100 disabled:opacity-40 transition-colors"
              >
                <PlugZap className="h-3.5 w-3.5" /> {testing ? "测试中…" : "测试连接"}
              </button>
              <button
                onClick={handleSave}
                className="btn btn-run inline-flex items-center px-5 py-2 text-xs font-semibold"
              >
                {saved ? "✓ 已保存" : "保存并启用"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};