import React, { useState, useEffect } from 'react';
import { 
  Play, Loader, CheckCircle, XCircle, Trash2, Plus, 
  Clock, Activity, TrendingUp, Calendar, Settings,
  Zap, Server, Cpu, BarChart3, Download, Copy
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('config');
  const [copiedToken, setCopiedToken] = useState(null);

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

  const copyToken = async (token) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const selectAllTokens = () => {
    setConfig(prev => ({
      ...prev,
      selectedTokens: prev.tokens
    }));
  };

  const deselectAllTokens = () => {
    setConfig(prev => ({
      ...prev,
      selectedTokens: []
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
    setActiveTab('results');

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

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k6-results-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <Zap className="text-blue-400" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              K6 Load Tester
            </h1>
          </div>
          <p className="text-blue-300 text-lg">
            Профессиональная платформа для нагрузочного тестирования
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings size={20} className="inline mr-2" />
            Конфигурация
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!results && !isRunning}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-green-200 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <BarChart3 size={20} className="inline mr-2" />
            Результаты
          </button>
        </div>

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Server size={20} />
                  Настройки Webhook
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="text"
                      value={config.webhookUrl}
                      onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="https://example.com/webhook"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Всего логов
                      </label>
                      <input
                        type="number"
                        value={config.totalLogs}
                        onChange={(e) => setConfig({ ...config, totalLogs: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Cpu size={20} />
                  Сводка теста
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-white">
                    <span>Токены:</span>
                    <span className="font-semibold">{config.selectedTokens.length}/{config.tokens.length}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Всего запросов:</span>
                    <span className="font-semibold">{config.totalLogs}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>RPS:</span>
                    <span className="font-semibold">{config.logsPerSecond}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Длительность:</span>
                    <span className="font-semibold">
                      {Math.ceil(config.totalLogs / config.logsPerSecond)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings size={20} />
                  Токены авторизации
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllTokens}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-semibold transition-colors"
                  >
                    Выбрать все
                  </button>
                  <button
                    onClick={deselectAllTokens}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm font-semibold transition-colors"
                  >
                    Снять все
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToken()}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Введите новый токен авторизации"
                />
                <button
                  onClick={addToken}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Добавить
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {config.tokens.map((token, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/20 hover:bg-white/10 transition-all group"
                  >
                    <input
                      type="checkbox"
                      checked={config.selectedTokens.includes(token)}
                      onChange={() => handleTokenSelect(token)}
                      className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-white font-mono text-sm truncate block">
                        {token}
                      </span>
                      {copiedToken === token && (
                        <span className="text-green-400 text-xs">Скопировано!</span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToken(token)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Копировать токен"
                      >
                        <Copy size={16} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => removeToken(token)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Удалить токен"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={runTest}
              disabled={isRunning || config.selectedTokens.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl text-white font-bold text-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine" />
              {isRunning ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Выполняется тестирование...
                </>
              ) : (
                <>
                  <Play size={24} />
                  Запустить нагрузочный тест
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/50 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-400" size={24} />
                  <p className="text-white font-semibold">{error}</p>
                </div>
              </div>
            )}

            {isRunning && (
              <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-500/50 rounded-2xl p-8 text-center">
                <Loader className="animate-spin mx-auto mb-4" size={48} />
                <p className="text-white text-xl font-semibold">Выполняется нагрузочное тестирование...</p>
                <p className="text-blue-300 mt-2">Пожалуйста, подождите</p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={32} />
                    <h2 className="text-3xl font-bold text-white">Результаты теста</h2>
                  </div>
                  <button
                    onClick={exportResults}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold transition-colors"
                  >
                    <Download size={20} />
                    Экспорт результатов
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="text-blue-300" size={20} />
                      <p className="text-blue-300 text-sm">Длительность</p>
                    </div>
                    <p className="text-white text-2xl font-bold">{results.duration}s</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-6 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="text-purple-300" size={20} />
                      <p className="text-purple-300 text-sm">Всего запросов</p>
                    </div>
                    <p className="text-white text-2xl font-bold">{results.totalRequests}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="text-green-300" size={20} />
                      <p className="text-green-300 text-sm">Успешно</p>
                    </div>
                    <p className="text-white text-2xl font-bold">{results.successRequests}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl p-6 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="text-red-300" size={20} />
                      <p className="text-red-300 text-sm">Ошибок</p>
                    </div>
                    <p className="text-white text-2xl font-bold">{results.failedRequests}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp size={18} />
                      Скорость обработки
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-purple-300 text-sm mb-1">Целевая скорость</p>
                        <p className="text-white text-xl font-bold">{results.targetRate} лог/сек</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm mb-1">Фактическая скорость</p>
                        <p className="text-white text-xl font-bold">{results.actualRate} лог/сек</p>
                        {Math.abs(parseFloat(results.actualRate) - results.targetRate) > 5 && (
                          <p className="text-yellow-300 text-xs mt-1">
                            ⚠ Отклонение от цели
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Activity size={18} />
                      Производительность
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-purple-300 text-sm mb-1">Успешность</p>
                        <div className="flex items-center gap-3">
                          <p className="text-white text-xl font-bold">{results.successRate}%</p>
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${results.successRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm mb-1">Интеграций</p>
                        <p className="text-white text-xl font-bold">{results.integrations}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Clock size={18} />
                      Время ответа
                    </h3>
                    <div className="space-y-3">
                      {results.avgRequestDuration && (
                        <div>
                          <p className="text-purple-300 text-sm">Среднее</p>
                          <p className="text-white font-bold">{results.avgRequestDuration}ms</p>
                        </div>
                      )}
                      {results.p95Duration && (
                        <div>
                          <p className="text-purple-300 text-sm">P95</p>
                          <p className="text-white font-bold">{results.p95Duration}ms</p>
                        </div>
                      )}
                      {results.maxDuration && (
                        <div>
                          <p className="text-purple-300 text-sm">Максимальное</p>
                          <p className="text-white font-bold">{results.maxDuration}ms</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {results.output && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                      <p className="text-purple-300 font-semibold">Детальный вывод K6</p>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <pre className="text-green-300 text-xs font-mono whitespace-pre-wrap">
                        {results.output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 2s infinite;
        }
      `}</style>
    </div>
  );
}