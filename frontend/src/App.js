import React, { useState, useEffect } from 'react';
import { Play, Loader, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';

export default function K6Dashboard() {
  const [config, setConfig] = useState({
    webhookUrl: 'https://web.paprikabitdev.com/webhook/v1/events',
    totalLogs: 100,
    logsPerSecond: 20,
    tokens: [
      'PBWK.V1.b_-V3MLpFElS3DCt.5UOnhVbeOS3ETCM_T-IO5Q',
      'PBWK.V1.G2dMV0f8qV1icKxs.D4lELIING_DNcbTO2gUkZg',
      'PBWK.V1.s7wMtqarI7r_sq-n.M-XgyYDKJBFIGBX4z4S8Cg',
      'PBWK.V1.uFUkz-eGEEHXvsLR.6XvmD8eZhJl3WU_lzlKsjg',
      'PBWK.V1.IOwSLXIB-Rpku3Nm.VG9o8jPDp48pyIHYyyPKWw'
    ],
    selectedTokens: []
  });

  const [newToken, setNewToken] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      selectedTokens: prev.tokens
    }));
  }, []);

  const handleTokenSelect = (token) => {
    setConfig(prev => {
      const isSelected = prev.selectedTokens.includes(token);
      return {
        ...prev,
        selectedTokens: isSelected
          ? prev.selectedTokens.filter(t => t !== token)
          : [...prev.selectedTokens, token]
      };
    });
  };

  const addToken = () => {
    if (newToken.trim() && !config.tokens.includes(newToken.trim())) {
      setConfig(prev => ({
        ...prev,
        tokens: [...prev.tokens, newToken.trim()],
        selectedTokens: [...prev.selectedTokens, newToken.trim()]
      }));
      setNewToken('');
    }
  };

  const removeToken = (token) => {
    setConfig(prev => ({
      ...prev,
      tokens: prev.tokens.filter(t => t !== token),
      selectedTokens: prev.selectedTokens.filter(t => t !== token)
    }));
  };

  const runTest = async () => {
    if (config.selectedTokens.length === 0) {
      setError('Выберите хотя бы один токен');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Ошибка при запуске теста');
      }
    } catch (err) {
      setError('Не удалось подключиться к серверу');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-2">
            K6 Load Tester
          </h1>
          <p className="text-purple-300 text-lg">
            Управление нагрузочным тестированием
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Webhook URL
              </label>
              <input
                type="text"
                value={config.webhookUrl}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/webhook"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Всего логов
                </label>
                <input
                  type="number"
                  value={config.totalLogs}
                  onChange={(e) => setConfig({ ...config, totalLogs: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Логов в секунду
                </label>
                <input
                  type="number"
                  value={config.logsPerSecond}
                  onChange={(e) => setConfig({ ...config, logsPerSecond: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Токены авторизации
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToken()}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Добавить новый токен"
                />
                <button
                  onClick={addToken}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {config.tokens.map((token, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={config.selectedTokens.includes(token)}
                      onChange={() => handleTokenSelect(token)}
                      className="w-5 h-5 rounded accent-purple-600"
                    />
                    <span className="flex-1 text-white font-mono text-sm truncate">
                      {token}
                    </span>
                    <button
                      onClick={() => removeToken(token)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-purple-300 text-sm mt-2">
                Выбрано: {config.selectedTokens.length} из {config.tokens.length}
              </p>
            </div>

            <button
              onClick={runTest}
              disabled={isRunning || config.selectedTokens.length === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {isRunning ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Тест выполняется...
                </>
              ) : (
                <>
                  <Play size={24} />
                  Запустить тест
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-400" size={24} />
              <p className="text-white font-semibold">{error}</p>
            </div>
          </div>
        )}

        {results && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="text-green-400" size={32} />
              <h2 className="text-3xl font-bold text-white">Результаты теста</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-purple-300 text-sm mb-1">Время выполнения</p>
                <p className="text-white text-2xl font-bold">{results.duration}s</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-purple-300 text-sm mb-1">Всего запросов</p>
                <p className="text-white text-2xl font-bold">{results.totalRequests}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-green-300 text-sm mb-1">Успешно</p>
                <p className="text-white text-2xl font-bold">{results.successRequests}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-red-300 text-sm mb-1">Ошибок</p>
                <p className="text-white text-2xl font-bold">{results.failedRequests}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-purple-300 text-sm mb-1">Целевая скорость</p>
                <p className="text-white text-xl font-bold">{results.targetRate} логов/сек</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-purple-300 text-sm mb-1">Фактическая скорость</p>
                <p className="text-white text-xl font-bold">{results.actualRate} логов/сек</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-purple-300 text-sm mb-1">Успешность</p>
                <p className="text-white text-xl font-bold">{results.successRate}%</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-purple-300 text-sm mb-1">Интеграций</p>
                <p className="text-white text-xl font-bold">{results.integrations}</p>
              </div>
            </div>

            {results.output && (
              <div className="mt-6 bg-black/30 rounded-xl p-4 border border-white/10">
                <p className="text-purple-300 text-sm mb-2 font-semibold">Вывод K6:</p>
                <pre className="text-white text-xs font-mono whitespace-pre-wrap">
                  {results.output}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}