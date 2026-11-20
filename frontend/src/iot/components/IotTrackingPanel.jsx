import React, { useState } from 'react';
import { Thermometer, Satellite, AlertTriangle, Copy, Check, Power } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useIotTracking, useActivateIot, useDeactivateIot } from '../hooks/useIotData';
import { formatRecordTime } from '../../lib/dateUtils';

/**
 * Suivi IoT réel d'une commande (cahier des charges 3.15) — remplace la
 * simulation initiale : seul un appareil possédant la clé générée ici peut
 * transmettre des relevés, et les franchissements de seuil déclenchent une
 * vraie alerte (voir alertThreshold.service côté backend pour le pattern
 * équivalent sur les prix/stocks).
 */
const IotTrackingPanel = ({ orderId, canManage }) => {
    const { data, loading } = useIotTracking(orderId);
    const activate = useActivateIot(orderId);
    const deactivate = useDeactivateIot(orderId);
    const [showForm, setShowForm] = useState(false);
    const [tempMin, setTempMin] = useState('2');
    const [tempMax, setTempMax] = useState('8');
    const [generatedKey, setGeneratedKey] = useState(null);
    const [copied, setCopied] = useState(false);

    if (loading) return null;
    if (!data?.suivi_iot_actif && !canManage) return null;

    const handleActivate = (e) => {
        e.preventDefault();
        activate.mutate(
            { temp_min: tempMin ? parseFloat(tempMin) : null, temp_max: tempMax ? parseFloat(tempMax) : null },
            { onSuccess: (res) => { setGeneratedKey(res.device_key); setShowForm(false); } }
        );
    };

    const copyKey = () => {
        navigator.clipboard.writeText(generatedKey);
        setCopied(true);
        toast.success('Clé copiée.');
        setTimeout(() => setCopied(false), 2000);
    };

    const logs = data?.logs || [];
    const chartData = logs.filter(l => l.temperature_celsius !== null && l.temperature_celsius !== undefined).map(l => ({
        time: formatRecordTime({ created_at: l.timestamp_appareil }),
        temp: parseFloat(l.temperature_celsius),
        horsSeuil: l.hors_seuil,
    }));
    const lastLog = logs[logs.length - 1];
    const curlExample = generatedKey
        ? `curl -X POST ${window.location.origin.replace(':5173', ':5000')}/api/iot/sensor-data \\\n  -H "Content-Type: application/json" -H "X-Device-Key: ${generatedKey}" \\\n  -d '{"commande_id":"${orderId}","temperature":5,"humidite":60}'`
        : '';

    return (
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Satellite className="size-5 text-primary" />
                    <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Suivi capteur (chaîne du froid)</h4>
                </div>
                {canManage && data?.suivi_iot_actif && (
                    <button onClick={() => deactivate.mutate()} disabled={deactivate.isPending}
                        className="h-8 px-3 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-rose-500 hover:border-rose-300 flex items-center gap-1.5 bg-transparent">
                        <Power className="size-3.5" /> Désactiver
                    </button>
                )}
            </div>

            {!data?.suivi_iot_actif ? (
                canManage && (
                    <div className="space-y-3">
                        {generatedKey ? (
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Clé d'appareil générée — copiez-la maintenant, elle ne sera plus affichée :</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-[11px] font-mono bg-card border border-border rounded-lg px-3 py-2 truncate">{generatedKey}</code>
                                    <button onClick={copyKey} className="size-9 shrink-0 rounded-lg border border-border flex items-center justify-center bg-transparent">
                                        {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                                    </button>
                                </div>
                                <pre className="text-[10px] font-mono bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{curlExample}</pre>
                            </div>
                        ) : showForm ? (
                            <form onSubmit={handleActivate} className="flex items-end gap-2 flex-wrap">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Temp. min (°C)</label>
                                    <input type="number" value={tempMin} onChange={e => setTempMin(e.target.value)} className="w-24 h-9 px-2 mt-1 rounded-lg border border-border bg-background text-sm outline-none block" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Temp. max (°C)</label>
                                    <input type="number" value={tempMax} onChange={e => setTempMax(e.target.value)} className="w-24 h-9 px-2 mt-1 rounded-lg border border-border bg-background text-sm outline-none block" />
                                </div>
                                <button type="submit" disabled={activate.isPending} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold border-none disabled:opacity-50">
                                    Générer la clé
                                </button>
                            </form>
                        ) : (
                            <button onClick={() => setShowForm(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold border-none">
                                Activer un capteur physique
                            </button>
                        )}
                    </div>
                )
            ) : (
                <>
                    {lastLog?.hors_seuil && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="size-4 shrink-0" />
                            Dernière lecture hors plage autorisée [{data.iot_temp_min ?? '—'}°C, {data.iot_temp_max ?? '—'}°C]
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/50 rounded-xl border border-border flex items-center gap-2">
                            <Thermometer className={cn("size-5", lastLog?.hors_seuil ? "text-rose-500" : "text-emerald-500")} />
                            <div>
                                <p className="text-[10px] text-muted-foreground font-black uppercase">Dernière lecture</p>
                                <p className="text-sm font-black text-foreground">{lastLog?.temperature_celsius !== null && lastLog?.temperature_celsius !== undefined ? `${lastLog.temperature_celsius}°C` : '—'}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-xl border border-border">
                            <p className="text-[10px] text-muted-foreground font-black uppercase">Plage autorisée</p>
                            <p className="text-sm font-black text-foreground">{data.iot_temp_min ?? '—'}°C — {data.iot_temp_max ?? '—'}°C</p>
                        </div>
                    </div>

                    {chartData.length > 1 && (
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} width={30} />
                                    <Tooltip formatter={(v) => [`${v}°C`, 'Température']} />
                                    {data.iot_temp_max !== null && data.iot_temp_max !== undefined && <ReferenceLine y={parseFloat(data.iot_temp_max)} stroke="#f43f5e" strokeDasharray="4 4" />}
                                    {data.iot_temp_min !== null && data.iot_temp_min !== undefined && <ReferenceLine y={parseFloat(data.iot_temp_min)} stroke="#f43f5e" strokeDasharray="4 4" />}
                                    <Line type="monotone" dataKey="temp" stroke="#1CA0DB" strokeWidth={2} dot={{ r: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {logs.length === 0 && (
                        <p className="text-xs text-muted-foreground">Suivi activé — en attente de la première transmission de l'appareil.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default IotTrackingPanel;
