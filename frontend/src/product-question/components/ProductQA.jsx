import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleQuestion, ThumbsUp, Trash2, CheckCircle2, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
    useProductQuestions, useAskProductQuestion, useAnswerProductQuestion,
    useMarkQuestionHelpful, useRemoveProductQuestion,
} from '../hooks/useProductQuestionData';

const AnswerBox = ({ question, canAnswer, onAnswer, pending }) => {
    const [reponse, setReponse] = useState('');
    if (question.reponse) {
        return (
            <div className="mt-3 pl-4 border-l-2 border-primary/30 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Réponse du fournisseur
                </p>
                <p className="text-sm text-foreground">{question.reponse}</p>
            </div>
        );
    }
    if (!canAnswer) {
        return <p className="mt-2 text-xs text-muted-foreground italic">En attente de réponse du fournisseur...</p>;
    }
    return (
        <div className="mt-3 flex gap-2">
            <input
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                placeholder="Répondre à cette question..."
                className="flex-1 h-9 px-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
            />
            <Button
                size="sm"
                disabled={pending || !reponse.trim()}
                onClick={() => { onAnswer(question.id, reponse); setReponse(''); }}
            >
                Répondre
            </Button>
        </div>
    );
};

const ProductQA = ({ productId, isAuthenticated, isOwner, currentUserId }) => {
    const [question, setQuestion] = useState('');
    const { data: questions, loading } = useProductQuestions(productId);
    const askMutation = useAskProductQuestion(productId);
    const answerMutation = useAnswerProductQuestion(productId);
    const helpfulMutation = useMarkQuestionHelpful(productId);
    const removeMutation = useRemoveProductQuestion(productId);

    const handleAsk = () => {
        if (!question.trim() || question.trim().length < 5) return;
        askMutation.mutate(question.trim(), { onSuccess: () => setQuestion('') });
    };

    return (
        <div className="space-y-6">
            {!isAuthenticated ? (
                <div className="p-6 rounded-[2rem] bg-muted/30 border border-border text-center space-y-3">
                    <p className="text-sm font-semibold text-foreground">Connectez-vous pour poser une question</p>
                    <Link to="/login" className="inline-block">
                        <Button size="sm">Se connecter</Button>
                    </Link>
                </div>
            ) : isOwner ? (
                <p className="text-sm text-muted-foreground">Répondez aux questions de vos clients ci-dessous.</p>
            ) : (
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                        <MessageCircleQuestion className="size-4 text-primary" />
                        Poser une question sur ce produit
                    </h4>
                    <div className="flex gap-2">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            rows={2}
                            placeholder="Ex. Ce produit est-il compatible avec... ?"
                            className="flex-1 px-4 py-2.5 bg-background border border-border rounded-2xl text-sm outline-none focus:border-primary/50 resize-none"
                        />
                    </div>
                    <Button
                        size="sm"
                        disabled={askMutation.isPending || question.trim().length < 5}
                        onClick={handleAsk}
                    >
                        {askMutation.isPending ? 'Publication...' : 'Publier la question'}
                    </Button>
                </div>
            )}

            {loading ? (
                <p className="text-sm text-muted-foreground">Chargement des questions...</p>
            ) : questions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune question pour ce produit — soyez le premier à en poser une.</p>
            ) : (
                <div className="space-y-5">
                    {questions.map((q) => (
                        <div key={q.id} className="p-5 rounded-2xl border border-border bg-card">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="size-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <User className="size-4 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-foreground">{q.auteur?.nom_complet || 'Utilisateur'}</p>
                                        <p className="text-sm text-foreground mt-0.5">{q.question}</p>
                                    </div>
                                </div>
                                {(currentUserId === q.utilisateur_id || isOwner) && (
                                    <button
                                        onClick={() => removeMutation.mutate(q.id)}
                                        className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            <AnswerBox
                                question={q}
                                canAnswer={isOwner}
                                onAnswer={(id, reponse) => answerMutation.mutate({ id, reponse })}
                                pending={answerMutation.isPending}
                            />

                            <button
                                onClick={() => helpfulMutation.mutate(q.id)}
                                className="mt-3 flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ThumbsUp className="size-3" /> Utile ({q.utile_count || 0})
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductQA;
