import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, CheckCircle2, XCircle, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { cn } from '../../lib/utils';

/**
 * Quiz de formation interactive (cahier des charges 3.14). Les bonnes
 * réponses ne sont jamais présentes côté client avant soumission — le
 * backend les retire de la charge utile (`getQuizForLearner`).
 */
const QuizModal = ({ resource, onClose, onCompleted }) => {
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const { data: quiz, isLoading } = useQuery({
        queryKey: ['education-quiz', resource.id],
        queryFn: async () => (await api.get(`/education/${resource.id}/quiz`)).data,
        enabled: !!resource,
    });

    const allAnswered = quiz && quiz.questions.every((_, i) => answers[i] !== undefined);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const reponses = quiz.questions.map((_, i) => answers[i]);
            const { data } = await api.post(`/education/${resource.id}/quiz/submit`, { reponses });
            setResult(data);
            onCompleted?.(data);
            toast[data.passed ? 'success' : 'warning'](
                data.passed ? 'Quiz réussi !' : 'Score insuffisant, réessayez.',
                { description: `${data.score}% (seuil : ${data.passing_score}%)` }
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Impossible de soumettre le quiz.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Quiz</p>
                        <h3 className="font-bold text-gray-900 dark:text-white">{resource.titre}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-5 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-primary" /></div>
                    ) : result ? (
                        <div className="text-center space-y-4 py-4">
                            <div className={cn('size-16 rounded-full mx-auto flex items-center justify-center', result.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                                <Award className="size-8" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{result.score}%</p>
                            <p className="text-sm text-gray-500">{result.passed ? 'Module validé !' : `Seuil requis : ${result.passing_score}%`}</p>
                            <div className="space-y-2 text-left">
                                {result.correction.map((c, i) => (
                                    <div key={i} className={cn('flex items-start gap-2 p-3 rounded-xl text-xs', c.correct ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
                                        {c.correct ? <CheckCircle2 className="size-4 shrink-0 mt-0.5" /> : <XCircle className="size-4 shrink-0 mt-0.5" />}
                                        <span>{c.question}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={onClose} className="w-full h-11 bg-gray-900 text-white rounded-xl font-bold text-sm">
                                Fermer
                            </button>
                        </div>
                    ) : quiz ? (
                        <>
                            {quiz.questions.map((q, qi) => (
                                <div key={qi} className="space-y-2">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{qi + 1}. {q.question}</p>
                                    <div className="space-y-1.5">
                                        {q.options.map((opt, oi) => (
                                            <button
                                                key={oi}
                                                type="button"
                                                onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                                                className={cn(
                                                    'w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all',
                                                    answers[qi] === oi
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-primary/30'
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={handleSubmit}
                                disabled={!allAnswered || submitting}
                                className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="size-4 animate-spin" />}
                                Valider mes réponses
                            </button>
                        </>
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-6">Aucun quiz disponible.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
