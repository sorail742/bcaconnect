import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

const emptyQuestion = () => ({ question: '', options: ['', ''], correct_index: 0 });

/** Éditeur de quiz (Admin) — cahier des charges 3.14. */
const QuizEditorModal = ({ resource, onClose }) => {
    const [questions, setQuestions] = useState([emptyQuestion()]);
    const [passingScore, setPassingScore] = useState(60);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get(`/education/${resource.id}/quiz/admin`)
            .then(({ data }) => {
                if (data) {
                    setQuestions(data.questions?.length ? data.questions : [emptyQuestion()]);
                    setPassingScore(data.passing_score || 60);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [resource.id]);

    const updateQuestion = (qi, patch) => {
        setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
    };
    const updateOption = (qi, oi, value) => {
        setQuestions((prev) => prev.map((q, i) => {
            if (i !== qi) return q;
            const options = [...q.options];
            options[oi] = value;
            return { ...q, options };
        }));
    };
    const addOption = (qi) => updateQuestion(qi, { options: [...questions[qi].options, ''] });
    const removeOption = (qi, oi) => {
        const q = questions[qi];
        if (q.options.length <= 2) return;
        const options = q.options.filter((_, i) => i !== oi);
        updateQuestion(qi, { options, correct_index: Math.min(q.correct_index, options.length - 1) });
    };
    const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
    const removeQuestion = (qi) => setQuestions((prev) => prev.filter((_, i) => i !== qi));

    const handleSave = async () => {
        for (const q of questions) {
            if (!q.question.trim() || q.options.some((o) => !o.trim())) {
                toast.error('Chaque question et chaque option doivent être remplies.');
                return;
            }
        }
        setSaving(true);
        try {
            await api.put(`/education/${resource.id}/quiz`, { questions, passing_score: passingScore });
            toast.success('Quiz enregistré.');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Impossible d\'enregistrer le quiz.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-border">
                <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Éditeur de quiz</p>
                        <h3 className="font-bold text-foreground">{resource.titre}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
                        <X className="size-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-primary" /></div>
                ) : (
                    <div className="p-5 space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Score minimum pour valider (%)
                            </label>
                            <input
                                type="number" min={0} max={100}
                                value={passingScore}
                                onChange={(e) => setPassingScore(Number(e.target.value))}
                                className="mt-2 w-32 h-10 px-3 bg-background border border-border rounded-xl text-sm outline-none"
                            />
                        </div>

                        {questions.map((q, qi) => (
                            <div key={qi} className="p-4 rounded-xl border border-border space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <input
                                        value={q.question}
                                        onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                                        placeholder={`Question ${qi + 1}`}
                                        className="flex-1 h-10 px-3 bg-background border border-border rounded-xl text-sm font-semibold outline-none"
                                    />
                                    {questions.length > 1 && (
                                        <button type="button" onClick={() => removeQuestion(qi)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`correct-${qi}`}
                                                checked={q.correct_index === oi}
                                                onChange={() => updateQuestion(qi, { correct_index: oi })}
                                                className="accent-primary"
                                                title="Bonne réponse"
                                            />
                                            <input
                                                value={opt}
                                                onChange={(e) => updateOption(qi, oi, e.target.value)}
                                                placeholder={`Option ${oi + 1}`}
                                                className="flex-1 h-9 px-3 bg-muted/30 border border-border rounded-lg text-sm outline-none"
                                            />
                                            {q.options.length > 2 && (
                                                <button type="button" onClick={() => removeOption(qi, oi)} className="p-1.5 text-muted-foreground hover:text-destructive">
                                                    <X className="size-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addOption(qi)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                                        <Plus className="size-3" /> Ajouter une option
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addQuestion} className="w-full h-11 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                            <Plus className="size-4" /> Ajouter une question
                        </button>

                        <Button onClick={handleSave} disabled={saving} className="w-full">
                            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Enregistrer le quiz
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizEditorModal;
