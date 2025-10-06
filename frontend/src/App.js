import React, { useState, useEffect } from 'react';
import { Play, Loader, CheckCircle, XCircle, Trash2, Plus, Clock, Activity, TrendingUp, Calendar } from 'lucide-react';

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

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

            {(results.startTime || results.endTime) && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/20 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="text-purple-300" size={20} />
                  <h3 className="text-white font-semibold">Время выполнения</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">Начало теста</p>
                    <p className="text-white font-mono text-sm">{formatDateTime(results.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm mb-1">Конец теста</p>
                    <p className="text-white font-mono text-sm">{formatDateTime(results.endTime)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-blue-300" size={18} />
                  <p className="text-blue-300 text-sm">Длительность</p>
                </div>
                <p className="text-white text-2xl font-bold">{results.duration}s</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-purple-300" size={18} />
                  <p className="text-purple-300 text-sm">Всего запросов</p>
                </div>
                <p className="text-white text-2xl font-bold">{results.totalRequests}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-300" size={18} />
                  <p className="text-green-300 text-sm">Успешно</p>
                </div>
                <p className="text-white text-2xl font-bold">{results.successRequests}</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="text-red-300" size={18} />
                  <p className="text-red-300 text-sm">Ошибок</p>
                </div>
                <p className="text-white text-2xl font-bold">{results.failedRequests}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-cyan-300" size={18} />
                  <p className="text-purple-300 text-sm">Целевая скорость</p>
                </div>
                <p className="text-white text-xl font-bold">{results.targetRate} лог/сек</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-cyan-300" size={18} />
                  <p className="text-purple-300 text-sm">Фактическая скорость</p>
                </div>
                <p className="text-white text-xl font-bold">{results.actualRate} лог/сек</p>
                {Math.abs(parseFloat(results.actualRate) - results.targetRate) > 5 && (
                  <p className="text-yellow-300 text-xs mt-1">
                    ⚠ Отклонение от цели
                  </p>
                )}
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-cyan-300" size={18} />
                  <p className="text-purple-300 text-sm">Успешность</p>
                </div>
                <p className="text-white text-xl font-bold">{results.successRate}%</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${results.successRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {results.avgRequestDuration && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <p className="text-purple-300 text-sm mb-1">Средняя длительность</p>
                  <p className="text-white text-lg font-bold">{results.avgRequestDuration}ms</p>
                </div>
              )}
              
              {results.p95Duration && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <p className="text-purple-300 text-sm mb-1">P95 длительность</p>
                  <p className="text-white text-lg font-bold">{results.p95Duration}ms</p>
                </div>
              )}
              
              {results.maxDuration && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <p className="text-purple-300 text-sm mb-1">Макс. длительность</p>
                  <p className="text-white text-lg font-bold">{results.maxDuration}ms</p>
                </div>
              )}
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                <p className="text-purple-300 text-sm mb-1">Интеграций</p>
                <p className="text-white text-lg font-bold">{results.integrations}</p>
              </div>
            </div>

            {results.warning && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300 text-xl">⚠</span>
                  <p className="text-yellow-200 text-sm">{results.warning}</p>
                </div>
              </div>
            )}

            {results.output && (
              <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10">
                  <p className="text-purple-300 text-sm font-semibold">Детальный вывод K6</p>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap">
                    {results.output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}