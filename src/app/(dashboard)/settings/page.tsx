'use client';

import { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  BookOpen,
  Bell,
  Bot,
  Eye,
  EyeOff,
  Info,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import { AIProvider, AI_PROVIDER_LABELS, AI_PROVIDER_MODELS } from '@/lib/ai-provider';

type IntegrationStatus = {
  notion: boolean;
  google: boolean;
};

const AI_PROVIDERS: Array<{
  value: AIProvider;
  label: string;
  icon: string;
  description: string;
  keyLabel: string;
  keyPlaceholder: string;
  docsUrl: string;
}> = [
  {
    value: 'anthropic',
    label: 'Claude',
    icon: '🤖',
    description: 'Anthropic 製の高性能 AI。コードレビューに特化したフィードバックが得意',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    value: 'openai',
    label: 'ChatGPT',
    icon: '💬',
    description: 'OpenAI 製の汎用 AI。GPT-4o を使用。幅広いプログラミング知識を持つ',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    value: 'gemini',
    label: 'Gemini',
    icon: '✨',
    description: 'Google 製の最新 AI。Gemini 2.0 Flash を使用。高速なレスポンスが特徴',
    keyLabel: 'Google AI Studio API Key',
    keyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
];

export default function SettingsPage() {
  const { aiProvider, aiApiKey, setAIProvider, setAIApiKey } = useAppStore();

  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    notion: false,
    google: false,
  });
  const [notionToken, setNotionToken] = useState('');
  const [notionPageId, setNotionPageId] = useState('');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(aiApiKey);
  const [isTesting, setIsTesting] = useState(false);

  const [notifications, setNotifications] = useState({
    daily_reminder: true,
    milestone_alert: true,
    weekly_summary: true,
  });

  const selectedProviderInfo = AI_PROVIDERS.find((p) => p.value === aiProvider)!;

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast.error('API キーを入力してください');
      return;
    }
    setAIApiKey(tempApiKey.trim());
    toast.success(`${AI_PROVIDER_LABELS[aiProvider]} の API キーを保存しました`);
  };

  const handleTestConnection = async () => {
    if (!tempApiKey.trim()) {
      toast.error('まず API キーを入力してください');
      return;
    }
    setIsTesting(true);
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': aiProvider,
          'x-ai-api-key': tempApiKey.trim(),
        },
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`接続成功！使用モデル: ${data.model}`);
        setAIApiKey(tempApiKey.trim());
      } else {
        toast.error(`接続失敗: ${data.error || 'APIキーを確認してください'}`);
      }
    } catch {
      toast.error('接続テストに失敗しました');
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnectNotion = async () => {
    if (!notionToken || !notionPageId) {
      toast.error('Notion 統合トークンとページIDを入力してください');
      return;
    }
    setIsConnecting('notion');
    try {
      const res = await fetch('/api/integrations/notion/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: notionToken, page_id: notionPageId }),
      });
      if (!res.ok) throw new Error();
      setIntegrations((prev) => ({ ...prev, notion: true }));
      toast.success('Notionと連携しました！学習プランが同期されます');
    } catch {
      toast.error('Notionとの連携に失敗しました。トークンとページIDを確認してください');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnecting('google');
    try {
      const res = await fetch('/api/integrations/google/auth');
      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch {
      toast.error('Google認証の開始に失敗しました');
      setIsConnecting(null);
    }
  };

  const handleDisconnect = (platform: keyof IntegrationStatus) => {
    setIntegrations((prev) => ({ ...prev, [platform]: false }));
    toast.success(`${platform === 'notion' ? 'Notion' : 'Google Calendar'}との連携を解除しました`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-800">設定・外部連携</h1>
        <p className="text-gray-500 mt-1">
          学習管理をより便利にするための連携設定です
        </p>
      </div>

      {/* AI プロバイダー設定 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">AI プロバイダー設定</h2>
              <p className="text-sm text-gray-500">
                スキル診断・コードレビュー・チャットに使用する AI を選択
              </p>
            </div>
            {aiApiKey && (
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                <CheckCircle2 size={12} />
                設定済み
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* プロバイダー選択 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              AI プロバイダーを選択
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setAIProvider(p.value);
                    setTempApiKey('');
                  }}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    aiProvider === p.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  )}
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-bold text-gray-800 text-sm">{p.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {AI_PROVIDER_MODELS[p.value]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 選択中プロバイダーの説明 */}
          <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3">
            <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-indigo-700">
              <p className="font-semibold mb-1">
                {selectedProviderInfo.icon} {selectedProviderInfo.label} について
              </p>
              <p className="text-indigo-600">{selectedProviderInfo.description}</p>
              <a
                href={selectedProviderInfo.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 mt-2 font-semibold hover:underline"
              >
                API キーを取得する <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* API キー入力 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              {selectedProviderInfo.keyLabel}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={selectedProviderInfo.keyPlaceholder}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              API キーはブラウザのローカルストレージに保存されます（サーバーには保存しません）
            </p>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              onClick={handleTestConnection}
              loading={isTesting}
              variant="outline"
              className="flex-1"
            >
              <Zap size={16} />
              接続テスト
            </Button>
            <Button onClick={handleSaveApiKey} className="flex-1">
              <CheckCircle2 size={16} />
              保存する
            </Button>
          </div>

          {/* 現在の設定状態 */}
          {aiApiKey && (
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 font-mono">
              <span className="text-gray-400">現在の設定: </span>
              {AI_PROVIDER_LABELS[aiProvider]} /{' '}
              {aiApiKey.slice(0, 8)}{'*'.repeat(Math.max(0, aiApiKey.length - 12))}{aiApiKey.slice(-4)}
            </div>
          )}
        </div>
      </div>

      {/* Notion連携 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Notion連携</h2>
                <p className="text-sm text-gray-500">マイルストーンとタスクをNotionで管理</p>
              </div>
            </div>
            <StatusBadge connected={integrations.notion} />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {!integrations.notion ? (
            <>
              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">設定手順</p>
                  <ol className="space-y-1 list-decimal list-inside text-blue-600">
                    <li>notion.so でインテグレーションを作成</li>
                    <li>Internal Integration Tokenをコピー</li>
                    <li>学習計画を管理したいページのIDを取得</li>
                    <li>ページにインテグレーションを招待</li>
                  </ol>
                  <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-2 font-semibold hover:underline"
                  >
                    Notionインテグレーション設定 <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Internal Integration Token
                </label>
                <input
                  type="password"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  placeholder="secret_..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  NotionページID（学習計画を作成するページ）
                </label>
                <input
                  type="text"
                  value={notionPageId}
                  onChange={(e) => setNotionPageId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  ページのURLから取得: notion.so/[ページ名]-[ここがID]
                </p>
              </div>

              <Button
                onClick={handleConnectNotion}
                loading={isConnecting === 'notion'}
                fullWidth
              >
                <Link2 size={16} />
                Notionと連携する
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <CheckCircle2 size={16} />
                  Notionと連携済み
                </div>
                <p>マイルストーンとタスクが自動同期されます</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetch('/api/integrations/notion', { method: 'POST' });
                    toast.success('Notionに同期しています...');
                  }}
                >
                  今すぐ同期
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDisconnect('notion')}
                >
                  連携解除
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Calendar連携 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Google Calendar連携</h2>
                <p className="text-sm text-gray-500">学習予定とマイルストーンをカレンダーに追加</p>
              </div>
            </div>
            <StatusBadge connected={integrations.google} />
          </div>
        </div>

        <div className="p-5">
          {!integrations.google ? (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Googleアカウントで認証し、カレンダーにマイルストーン・学習リマインダーを自動追加します。
                </p>
              </div>
              <Button
                onClick={handleConnectGoogle}
                loading={isConnecting === 'google'}
                fullWidth
              >
                <Calendar size={16} />
                Googleでログインして連携
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <CheckCircle2 size={16} />
                  Google Calendarと連携済み
                </div>
                <p>学習予定とマイルストーンが自動追加されます</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetch('/api/integrations/google', { method: 'POST' });
                    toast.success('Google Calendarに同期しています...');
                  }}
                >
                  今すぐ同期
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDisconnect('google')}
                >
                  連携解除
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 通知設定 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Bell size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">通知設定</h2>
              <p className="text-sm text-gray-500">学習リマインダーとアラートを管理</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {[
            { key: 'daily_reminder', label: '毎日の学習リマインダー', desc: '設定した時間に学習リマインダーを送信' },
            { key: 'milestone_alert', label: 'マイルストーン期限アラート', desc: '期限2日前にアラートを送信' },
            { key: 'weekly_summary', label: '週次進捗レポート', desc: '毎週月曜日に学習サマリーをメールで送信' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
              <div>
                <div className="font-medium text-gray-800 text-sm">{setting.label}</div>
                <div className="text-xs text-gray-400">{setting.desc}</div>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [setting.key]: !prev[setting.key as keyof typeof notifications],
                  }))
                }
                className={clsx(
                  'w-12 h-6 rounded-full transition-colors relative',
                  notifications[setting.key as keyof typeof notifications]
                    ? 'bg-indigo-500'
                    : 'bg-gray-200'
                )}
              >
                <div
                  className={clsx(
                    'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                    notifications[setting.key as keyof typeof notifications]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
        connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      )}
    >
      {connected ? (
        <>
          <CheckCircle2 size={12} />
          連携済み
        </>
      ) : (
        <>
          <AlertCircle size={12} />
          未連携
        </>
      )}
    </div>
  );
}
